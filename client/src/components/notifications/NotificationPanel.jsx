import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';

const NotificationPanel = ({ userId, showToast }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, [userId]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            // If endpoint doesn't exist yet, use mock data
            setNotifications(getMockNotifications());
        } finally {
            setLoading(false);
        }
    };

    const getMockNotifications = () => [
        {
            _id: '1',
            type: 'submission',
            title: 'Document Submitted',
            message: 'Your Chapter 1 document has been submitted successfully.',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        },
        {
            _id: '2',
            type: 'feedback',
            title: 'Adviser Feedback',
            message: 'Your adviser has provided feedback on your proposal.',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
            _id: '3',
            type: 'status',
            title: 'Status Updated',
            message: 'Your project status has been updated to "Chapter 1".',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
            _id: '4',
            type: 'similarity',
            title: 'Similarity Check Complete',
            message: 'Your document similarity check is complete. View the report.',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        },
    ];

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (err) {
            // Mock update
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            showToast?.('success', 'All notifications marked as read');
        } catch (err) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'submission':
                return '📄';
            case 'feedback':
                return '💬';
            case 'status':
                return '🔄';
            case 'similarity':
                return '🔍';
            case 'deadline':
                return '⏰';
            default:
                return '🔔';
        }
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

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center">
                        <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-indigo-600 dark:tw-border-indigo-400"></div>
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
                        <CardTitle>Notifications</CardTitle>
                        {unreadCount > 0 && (
                            <Badge variant="destructive">{unreadCount} new</Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-text-indigo-700 dark:hover:tw-text-indigo-300"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Filter tabs */}
                <div className="tw-flex tw-gap-2 tw-mt-4">
                    {['all', 'unread', 'read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded tw-capitalize tw-transition-colors
                                ${filter === f
                                    ? 'tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-text-indigo-700 dark:tw-text-indigo-300'
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
                        <p className="tw-text-4xl tw-mb-2">🔔</p>
                        <p>No {filter !== 'all' ? filter : ''} notifications</p>
                    </div>
                ) : (
                    <ul className="tw-divide-y tw-divide-border">
                        {filteredNotifications.map(notification => (
                            <li
                                key={notification._id}
                                className={`tw-p-4 tw-flex tw-gap-4 tw-transition-colors hover:tw-bg-muted tw-cursor-pointer
                                    ${!notification.read ? 'tw-bg-indigo-500/5 dark:tw-bg-indigo-500/10' : ''}`}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                            >
                                <div className="tw-text-2xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="tw-flex-1 tw-min-w-0">
                                    <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
                                        <h4 className={`tw-font-medium tw-text-foreground tw-truncate
                                            ${!notification.read ? 'tw-font-semibold' : ''}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="tw-text-xs tw-text-muted-foreground tw-whitespace-nowrap">
                                            {getTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-indigo-600 dark:tw-bg-indigo-400 tw-mt-2"></div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default NotificationPanel;
