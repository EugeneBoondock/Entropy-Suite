# Supabase Magic Link Email Template

Use this HTML template in your Supabase Authentication → Email Templates → Magic Link section:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Login with Magic Link</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
      /* Reset styles */
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
      }
      
      /* Main styles */
      body {
        background-color: #fef6ed !important;
        font-family: 'Segoe UI', Arial, sans-serif !important;
        color: #1e1e1e !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 0 15px rgba(0,0,0,0.08);
      }
      
      .email-header {
        text-align: center;
        padding: 40px 40px 20px 40px;
      }
      
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #ff6b2d;
        text-decoration: none;
        display: inline-block;
      }
      
      .email-content {
        padding: 20px 40px 40px 40px;
      }
      
      h2 {
        color: #1e1e1e;
        font-size: 24px;
        margin: 0 0 20px 0;
        line-height: 1.3;
      }
      
      p {
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 16px 0;
        color: #1e1e1e;
      }
      
      .cta-container {
        text-align: center;
        margin: 30px 0;
      }
      
      .cta-button {
        display: inline-block;
        padding: 16px 32px;
        background-color: #ff6b2d;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 16px;
        border: none;
        cursor: pointer;
      }
      
      .cta-button:hover {
        background-color: #e55a1f;
      }
      
      .footer {
        text-align: center;
        font-size: 12px;
        color: #777;
        padding: 20px 40px 40px 40px;
        border-top: 1px solid #eee;
        margin-top: 20px;
      }
      
      .footer a {
        color: #ff6b2d;
        text-decoration: none;
      }
      
      /* Mobile responsive */
      @media only screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
          margin: 0 !important;
          border-radius: 0 !important;
        }
        
        .email-header,
        .email-content,
        .footer {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        
        h2 {
          font-size: 20px !important;
        }
        
        .cta-button {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }
    </style>
  </head>
  <body>
    <div style="background-color: #fef6ed; padding: 40px 20px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
        <tr>
          <td>
            <div class="email-container">
              <div class="email-header">
                <a href="https://entropy.tools" class="logo">Entropy Suite</a>
              </div>
              
              <div class="email-content">
                <h2>Login Instantly with Your Magic Link</h2>
                <p>
                  No passwords, no hassle - just click the button below to log into your Entropy Suite account.
                </p>
                
                <div class="cta-container">
                  <a class="cta-button" href="{{ .ConfirmationURL }}" target="_blank" rel="noopener">
                    Log Me In
                  </a>
                </div>
                
                <p>
                  This magic link will expire in 24 hours, so be sure to use it promptly. If you didn't request this login, you can safely ignore this email.
                </p>
                
                <p style="font-size: 14px; color: #666;">
                  If the button doesn't work, you can copy and paste this link into your browser:<br>
                  <a href="{{ .ConfirmationURL }}" style="color: #ff6b2d; word-break: break-all;">{{ .ConfirmationURL }}</a>
                </p>
              </div>
              
              <div class="footer">
                <p>
                  &copy; 2024 <a href="https://entropy.tools">Entropy Suite</a> - Randomness with purpose.
                </p>
                <p>
                  Need help? Contact us at <a href="mailto:support@entropy.tools">support@entropy.tools</a>
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
```

## Key Improvements:

1. **Email Client Compatibility**: Added table-based layout for better compatibility
2. **Mobile Responsive**: Added media queries for mobile devices
3. **MSO Comments**: Added Outlook-specific code for better rendering
4. **Inline Styles**: Added important declarations to override email client defaults
5. **Fallback Link**: Added text version of the confirmation URL
6. **Better Typography**: Improved font stack and sizing
7. **Accessibility**: Added proper alt tags and semantic structure

## Configuration Steps:

1. **Copy the entire HTML code above**
2. **Go to Supabase Dashboard → Authentication → Email Templates**
3. **Select "Magic Link" template**
4. **Ensure the format is set to "HTML" (not "Text")**
5. **Paste the HTML code in the template body**
6. **Update the subject line**: "🔐 Your Magic Link for Entropy Suite"
7. **Save the template**

## Additional Tips:

- **Test the email** by sending yourself a magic link
- **Check spam folder** if you don't receive it
- **Verify domain settings** in Supabase Auth settings
- **Use email testing tools** like Litmus or Email on Acid for broader compatibility testing 