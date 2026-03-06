# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public issue
2. Email security concerns to: security@example.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

### For Deployment

- Never commit `.env` files with sensitive data
- Use environment variables for secrets
- Enable HTTPS in production
- Implement rate limiting
- Use strong authentication
- Keep dependencies updated
- Regular security audits

### For Development

- Use virtual environments
- Pin dependency versions
- Scan for vulnerabilities regularly
- Follow OWASP guidelines
- Validate all user inputs
- Sanitize data before processing

## Known Security Considerations

- This is a development server; use production WSGI server (Gunicorn) in production
- CORS is currently open; restrict origins in production
- No authentication implemented; add auth for production use
- Rate limiting not implemented; add for production

## Updates

Security updates will be released as patch versions and documented in CHANGELOG.md.
