const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = "abdo <abdo@abdo.io>";
    this.url = url;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return 1;
    }
    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: "25",
      auth: {
        user: "39579f69e3f48f",
        pass: "cd2e543489e772",
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async send(templete, subject) {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/email/${templete}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        }
      );
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        // text: htmlToText.fromString(html),
      };
      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
      // Handle the error as needed (e.g., log it, notify administrators, etc.)
    }
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the Natours Family.");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "your password reset token (valid for only 10 minutes)."
    );
  }
};
