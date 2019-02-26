# Netlify OAuth

Example of how to use Netlify OAuth Applications

## Setup

1. Deploy a new site

2. [Create OAuth application](https://app.netlify.com/account/applications)

    Create your Oauth application. Add in your callback URL. This can be changed later.

    ![image](https://user-images.githubusercontent.com/532272/53382433-3066da00-3929-11e9-978a-74d802c212db.png)

3. After creating your OAuth app, Click on show credentials

    Save these credentials for the next step

    ![image](https://user-images.githubusercontent.com/532272/53382437-3957ab80-3929-11e9-9cbf-b812cd04c2c7.png)

4. Take your OAuth credentials and add them to your OAuth app site

    Set `NETLIFY_OAUTH_CLIENT_ID` and `NETLIFY_OAUTH_CLIENT_SECRET` environment variables in your site

    ![image](https://user-images.githubusercontent.com/532272/53382472-53918980-3929-11e9-9d24-598247b5f2c6.png)

5. Then trigger a new deploy

    ![image](https://user-images.githubusercontent.com/532272/53382490-6015e200-3929-11e9-9f6b-92be59d78e59.png)


6. Visit your site and verify the OAuth flow is working
