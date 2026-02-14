import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import {
    FileText,
    MessageCircle,
    RefreshCw,
    Search,
    Clock,
    Bell,
    CheckCircle,
    AlertTriangle,
    Trash2,
    Check,
    Loader2,
} from 'lucide-react';

const NotificationPanel = ({ showToast }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            
            const params = new URLSearchParams({
                page: pageNum,
                limit: 20,
                unreadOnly: filter === 'unread' ? 'true' : 'false'
            });

            const res = await api.get(`/notifications?${params}`);
            
            if (res.data?.success) {
                const { notifications: newNotifications, pagination, unreadCount: count } = res.data.data;
                
                if (append) {
                    setNotifications(prev => [...prev, ...newNotifications]);
                } else {
                    setNotifications(newNotifications);
                }
                
                setUnreadCount(count);
                setHasMore(pagination.page < pagination.pages);
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
            // Fallback to empty state if API fails
            if (!append) {
                setNotifications([]);
                setUnreadCount(0);
            }
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        setPage(1);
        fetchNotifications(1);
    }, [filter, fetchNotifications]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/notifications/unread-count');
            if (res.data?.success) {
                setUnreadCount(res.data.data.count);
            }
        } catch (err) {
            // Silent fail for count refresh
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            setActionLoading(notificationId);
            const res = await api.put(`/notifications/${notificationId}/read`);
            
            if (res.data?.success) {
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notificationId ? { ...n, read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            showToast?.('error', 'Failed to mark notification as read');
        } finally {
            setActionLoading(null);
        }
    };

    const markAllAsRead = async () => {
        try {
            setActionLoading('all');
            const res = await api.put('/notifications/mark-all-read');
            
            if (res.data?.success) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
                showToast?.('success', 'All notifications marked as read');
            }
        } catch (err) {
            showToast?.('error', 'Failed to mark all as read');
        } finally {
            setActionLoading(null);
        }
    };

    const deleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        try {
            setActionLoading(`delete-${notificationId}`);
            const res = await api.delete(`/notifications/${notificationId}`);
            
            if (res.data?.success) {
                const deleted = notifications.find(n => n._id === notificationId);
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
                if (!deleted?.read) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
                showToast?.('success', 'Notification deleted');
            }
        } catch (err) {
            showToast?.('error', 'Failed to delete notification');
        } finally {
            setActionLoading(null);
        }
    };

    const clearReadNotifications = async () => {
        try {
            setActionLoading('clear');
            const res = await api.delete('/notifications/clear-read');
            
            if (res.data?.success) {
                setNotifications(prev => prev.filter(n => !n.read));
                showToast?.('success', res.data.message);
            }
        } catch (err) {
            showToast?.('error', 'Failed to clear notifications');
        } finally {
            setActionLoading(null);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    const getNotificationIcon = (type) => {
        const iconMap = {
            'PROPOSAL_SUBMITTED': <FileText className="tw-w-5 tw-h-5 tw-text-indigo-500" />,
            'REVISION_REQUESTED': <AlertTriangle className="tw-w-5 tw-h-5 tw-text-amber-500" />,
            'PROPOSAL_APPROVED': <CheckCircle className="tw-w-5 tw-h-5 tw-text-emerald-500" />,
            'STATUS_CHANGED': <RefreshCw className="tw-w-5 tw-h-5 tw-text-blue-500" />,
            'COMMENT_ADDED': <MessageCircle className="tw-w-5 tw-h-5 tw-text-purple-500" />,
            'DOCUMENT_UPLOADED': <FileText className="tw-w-5 tw-h-5 tw-text-teal-500" />,
            'DEADLINE_REMINDER': <Clock className="tw-w-5 tw-h-5 tw-text-red-500" />,
            'ADVISER_ASSIGNED': <Check className="tw-w-5 tw-h-5 tw-text-green-500" />,
            'PROJECT_ARCHIVED': <Search className="tw-w-5 tw-h-5 tw-text-gray-500" />,
            'DEFENSE_SCHEDULED': <Clock className="tw-w-5 tw-h-5 tw-text-orange-500" />,
        };

        return iconMap[type] || <Bell className="tw-w-5 tw-h-5 tw-text-muted-foreground" />;
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading notifications...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="tw-border-b tw-border-border">
                <div className="tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <CardTitle className="tw-flex tw-items-center tw-gap-2">
                            <Bell className="tw-w-5 tw-h-5" />
                            Notifications
                        </CardTitle>
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount} new</Badge>
                        )}
                    </div>
                    <div className="tw-flex tw-gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                disabled={actionLoading === 'all'}
                                className="tw-text-indigo-600 dark:tw-text-indigo-400"
                            >
                                {actionLoading === 'all' ? (
                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                ) : (
                                    <Check className="tw-w-4 tw-h-4 tw-mr-1" />
                                )}
                                Mark all read
                            </Button>
                        )}
                        {notifications.some(n => n.read) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearReadNotifications}
                                disabled={actionLoading === 'clear'}
                                className="tw-text-red-600 dark:tw-text-red-400"
                            >
                                {actionLoading === 'clear' ? (
                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                ) : (
                                    <Trash2 className="tw-w-4 tw-h-4 tw-mr-1" />
                                )}
                                Clear read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="tw-flex tw-gap-2 tw-mt-4">
                    {['all', 'unread', 'read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-md tw-capitalize tw-transition-colors tw-font-medium
                                ${filter === f
                                    ? 'tw-bg-indigo-500 tw-text-white'
                                    : 'tw-text-muted-foreground hover:tw-bg-muted'
                                }`}
                        >
                            {f}
                            {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="tw-p-0">
                {filteredNotifications.length === 0 ? (
                    <div className="tw-p-8 tw-text-center tw-text-muted-foreground">
                        <Bell className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-3 tw-opacity-30" />
                        <p className="tw-text-lg tw-font-medium">No {filter !== 'all' ? filter : ''} notifications</p>
                        <p className="tw-text-sm tw-mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    <>
                        <ul className="tw-divide-y tw-divide-border">
                            {filteredNotifications.map(notification => (
                                <li
                                    key={notification._id}
                                    className={`tw-p-4 tw-flex tw-gap-3 tw-transition-colors hover:tw-bg-muted/50 tw-cursor-pointer tw-group
                                        ${!notification.read ? 'tw-bg-indigo-500/5 dark:tw-bg-indigo-500/10' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification._id)}
                                >
                                    <div className="tw-flex-shrink-0 tw-p-2 tw-bg-muted tw-rounded-full">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="tw-flex-1 tw-min-w-0">
                                        <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
                                            <h4 className={`tw-text-sm tw-text-foreground tw-truncate
                                                ${!notification.read ? 'tw-font-semibold' : 'tw-font-medium'}`}>
                                                {notification.title}
                                            </h4>
                                            <div className="tw-flex tw-items-center tw-gap-2">
                                                <span className="tw-text-xs tw-text-muted-foreground tw-whitespace-nowrap">
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                                <button
                                                    onClick={(e) => deleteNotification(notification._id, e)}
                                                    disabled={actionLoading === `delete-${notification._id}`}
                                                    className="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-p-1 tw-rounded hover:tw-bg-red-100 dark:hover:tw-bg-red-900/30"
                                                >
                                                    {actionLoading === `delete-${notification._id}` ? (
                                                        <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-text-red-500" />
                                                    ) : (
                                                        <Trash2 className="tw-w-4 tw-h-4 tw-text-red-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1 tw-line-clamp-2">
                                            {notification.message}
                                        </p>
                                        {notification.relatedProject && (
                                            <span className="tw-text-xs tw-text-indigo-600 dark:tw-text-indigo-400 tw-mt-1 tw-inline-block">
                                                View project →
                                            </span>
                                        )}
                                    </div>
                                    {!notification.read && (
                                        <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-indigo-600 dark:tw-bg-indigo-400 tw-flex-shrink-0 tw-mt-2"></div>
                                    )}
                                </li>
                            ))}
                        </ul>
                        
                        {hasMore && (
                            <div className="tw-p-4 tw-border-t tw-border-border">
                                <Button
                                    variant="outline"
                                    className="tw-w-full"
                                    onClick={loadMore}
                                >
                                    Load more
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default NotificationPanel;
