# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Campaign Email Setup

Campaign email sending uses EmailJS from the frontend. Add these variables to your `.env` file:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Template variables expected by this project:

- `to_name`
- `to_email`
- `subject`
- `message`

Optional variables for a richer professional template:

- `message_html`
- `preview_text`
- `brand_name`
- `from_name`
- `current_year`

Suggested EmailJS HTML content template:

```html
<div style="margin:0;padding:0;background:#f3f6fb;font-family:Segoe UI,Arial,sans-serif;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f3f6fb;">
		<tr>
			<td align="center">
				<table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
					<tr>
						<td style="padding:20px 24px;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:#ffffff;">
							<div style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:.9;">{{brand_name}}</div>
							<h1 style="margin:8px 0 0 0;font-size:20px;line-height:1.35;font-weight:700;">{{subject}}</h1>
						</td>
					</tr>
					<tr>
						<td style="padding:22px 24px 4px 24px;color:#111827;font-size:15px;line-height:1.65;">
							<p style="margin:0 0 14px 0;">Hello {{to_name}},</p>
							{{{message_html}}}
						</td>
					</tr>
					<tr>
						<td style="padding:10px 24px 24px 24px;">
							<div style="border-top:1px solid #e5e7eb;padding-top:14px;color:#4b5563;font-size:12px;line-height:1.6;">
								This is an automated communication from {{brand_name}}.<br/>
								Sent by {{from_name}} | {{current_year}}
							</div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</div>
```
