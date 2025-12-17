const https = require('https');

const postForm = ({ url, form, timeoutMs }) => {
    return new Promise((resolve, reject) => {
        try {
            const payload = new URLSearchParams(form).toString();
            const request = https.request(
                url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(payload),
                    },
                    timeout: timeoutMs,
                },
                (response) => {
                    let body = '';

                    response.setEncoding('utf8');
                    response.on('data', (chunk) => {
                        body += chunk;
                    });

                    response.on('end', () => {
                        resolve({ statusCode: response.statusCode, body });
                    });
                }
            );

            request.on('timeout', () => {
                request.destroy(new Error('Request timeout'));
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.write(payload);
            request.end();
        } catch (error) {
            reject(error);
        }
    });
};

const verifyRecaptchaToken = async ({ token, remoteIp } = {}) => {
    try {
        const secret = process.env.RECAPTCHA_SECRET_KEY;
        if (!secret) {
            return { success: false, error: 'missing_secret' };
        }

        const trimmedToken = String(token || '').trim();
        if (!trimmedToken) {
            return { success: false, error: 'missing_token' };
        }

        const form = {
            secret,
            response: trimmedToken,
        };

        if (remoteIp) {
            form.remoteip = remoteIp;
        }

        const { statusCode, body } = await postForm({
            url: 'https://www.google.com/recaptcha/api/siteverify',
            form,
            timeoutMs: 5000,
        });

        if (statusCode !== 200) {
            return { success: false, error: 'bad_status', statusCode };
        }

        let parsed;
        try {
            parsed = JSON.parse(body);
        } catch (error) {
            return { success: false, error: 'invalid_json' };
        }

        // reCAPTCHA v2 returns: { success, challenge_ts, hostname, 'error-codes': [] }
        return {
            success: Boolean(parsed?.success),
            hostname: parsed?.hostname || null,
            challengeTs: parsed?.challenge_ts || null,
            errorCodes: parsed?.['error-codes'] || [],
        };
    } catch (error) {
        return { success: false, error: 'request_failed', message: error.message };
    }
};

module.exports = {
    verifyRecaptchaToken,
};
