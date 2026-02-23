export const welcomeMail = (data) => `
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap");
      @import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@600&display=swap");


      body,
      div,
      p,
      a {
        font-family: "Inter", Arial, sans-serif;
        font-weight: 600;
      }
    </style>

  </head>

  <body>
    <div style="
          font-family: 'Inter', Arial, sans-serif;
          font-weight: 600;
          line-height: 1.5;
          color: #6b6b6b;
          background-color: #fffcf7;
          margin: 0 auto;
          padding: 24px;
          max-width: 400px;
          overflow: hidden;
          position: relative;
          padding-bottom: 100px;
          background: url('https://tirlun-general.s3.eu-west-2.amazonaws.com/emailBackgroundImage.png');
          background-repeat: no-repeat;
          background-size: contain;
          background-position: bottom;
        ">
      <div style="text-align: center; margin-bottom: 40px">
        <picture>
          <img src="https://tirlun-general.s3.eu-west-2.amazonaws.com/tirlunColorIconText.png" alt="tirlun logo"
            style="width: 200px" />
        </picture>
      </div>
      <p style="margin: 0; padding: 0">Hi ${data.first_name},</p>
      <br />
      <p style="margin: 0; padding: 0">
        Welcome to BuildUp Blogs! Your account has been verified.
      </p>
      <br />
      <p style="margin: 0; padding: 0">
        Now you have full access to the blog platform, you can comment on posts and like posts likewise.
      </p>
      <br />
      <p style="margin: 0; padding: 0">
        Thank you for joining the BuildUp Blogs.
      </p>
      <br />
      <p style="margin: 0; padding: 0">
        — The BuildupBlog Team
      </p>
      <br />
      <div>
        <p style="margin-bottom: 10; padding: 0">Follow us:</p>
        <div>
          <a href="https://www.linkedin.com/company/tirlun-ai/about/?viewAsMember=true" target="_blank"
            style="display: inline; text-decoration: none">
            <img src="https://tirlun-general.s3.eu-west-2.amazonaws.com/linkedin.png" alt="" />
          </a>
          <a href="https://www.instagram.com/tirlun.ai?igsh=bGxuOWE4eWl2ZjQx" target="_blank"
            style="display: inline; margin-left: 20px; text-decoration: none">
            <img src="https://tirlun-general.s3.eu-west-2.amazonaws.com/instagram.png" alt="" />
          </a>

          <a href="https://www.facebook.com/share/1Ba9TxKjf7/?mibextid=LQQJ4d" target="_blank"
            style="display: inline; margin-left: 20px; text-decoration: none">
            <img src="https://tirlun-general.s3.eu-west-2.amazonaws.com/facebook.png" alt="" />
          </a>
        </div>
      </div>
      <br />
    </div>
  </body>
</html>
`;