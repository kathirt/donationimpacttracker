# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by emailing the development team. Please do not create public GitHub issues for security vulnerabilities.

## Security Best Practices

### Environment Variables

This application uses several environment variables that should be kept secure:

- `REACT_APP_AZURE_MAPS_CLIENT_ID` - Azure Maps subscription key
- `REACT_APP_AZURE_OPENAI_KEY` - Azure OpenAI API key
- `REACT_APP_AZURE_OPENAI_ENDPOINT` - Azure OpenAI service endpoint

**Important:**
- Never commit these values to source control
- Use GitHub Secrets for CI/CD pipelines
- Use Azure Key Vault for production deployments
- Rotate keys regularly

### Input Validation

All user inputs should be validated and sanitized:

1. **API Endpoints**: Use the validation utilities in `src/utils/validation.ts`
2. **Frontend Forms**: Validate on both client and server side
3. **Donation Amounts**: Must be positive numbers
4. **Email Addresses**: Must match valid email format
5. **IDs and Names**: Sanitize to prevent XSS attacks

### Authentication & Authorization

- Authentication tokens should be stored securely
- Use HTTPS for all API communications
- Implement proper session management
- Use Azure AD for production authentication

### Dependencies

Regular dependency updates are crucial:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix vulnerabilities automatically
npm audit fix
```

### Content Security Policy

The application implements strict CSP headers in `staticwebapp.config.json`:

- No inline scripts except for trusted sources
- Restricted external domains
- Frame ancestors denied (prevents clickjacking)

### Data Protection

- All API requests should use HTTPS
- Sensitive data should be encrypted at rest
- Use Azure Storage encryption for data persistence
- Implement proper data retention policies

### Security Headers

The application implements the following security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` with restricted sources

## Known Issues and Mitigations

### Azure Maps Authentication

The demo uses anonymous authentication for Azure Maps. In production:

1. Use subscription key authentication
2. Store keys in Azure Key Vault
3. Implement token refresh mechanism
4. Monitor API usage for anomalies

## Security Checklist for Deployment

- [ ] All environment variables configured in Azure
- [ ] API keys stored in Azure Key Vault
- [ ] HTTPS enforced for all endpoints
- [ ] CSP headers configured correctly
- [ ] Input validation enabled on all forms
- [ ] Error messages don't expose sensitive information
- [ ] Logging configured but doesn't log sensitive data
- [ ] Rate limiting enabled on API endpoints
- [ ] CORS configured with specific origins
- [ ] Dependencies updated and scanned for vulnerabilities

## Compliance

This application should comply with:

- GDPR for European users
- CCPA for California residents
- PCI DSS if handling payment information
- Local data protection regulations

## Contact

For security concerns, contact: [security@yourorganization.org]
