exports.accountCreationEmail = (name, email, password, patientId) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Registration Confirmation</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
				text-align: left;
			}
	
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #2563EB;
				color: #ffffff;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.credentials {
				background-color: #f3f4f6;
				padding: 15px;
				border-radius: 8px;
				text-align: left;
				margin: 20px 0;
			}

			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<div class="message">Welcome to City Care Hospital</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>Your patient account has been created successfully. You can now log in to book appointments, view your medical reports, and manage your profile.</p>
				
				<div class="credentials">
					<p><strong>Patient ID:</strong> ${patientId}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Temporary Password:</strong> ${password}</p>
				</div>

				<p>Please log in and change your password immediately.</p>
				
				<a class="cta" href="http://localhost:3000/login">Login to Dashboard</a>
			</div>
			<div class="support">If you have any questions, please contact our support team.</div>
		</div>
	</body>
	
	</html>`;
};