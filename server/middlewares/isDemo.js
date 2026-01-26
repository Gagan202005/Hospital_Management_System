require("dotenv").config();

exports.isDemo = async (req, res, next) => {
    try {
        // 1. Get the email from the authenticated user
        // (Assumes you ran the 'auth' middleware before this)
        const userEmail = req.user.email; 

        // 2. Define your Demo Emails (You can put these in .env)
        const restrictedEmails = [
            "gagansinghal2005@gmail.com",
        ];

        // 3. Check if the current user is a Demo User
        if (restrictedEmails.includes(userEmail)) {
            
            // 4. Check the HTTP Method
            // Allow GET requests (Reading data)
            // Block POST, PUT, DELETE, PATCH (Writing/Deleting data)
            if (req.method !== "GET") {
                return res.status(403).json({
                    success: false,
                    message: "⚠️ This is a Demo Account. Modification features are disabled.",
                });
            }
        }

        // 5. If not demo user (or if method is GET), proceed
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong in demo check",
        });
    }
};