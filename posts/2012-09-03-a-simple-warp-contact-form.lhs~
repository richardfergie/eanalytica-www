---
title: A Simple Contact Form Using Warp
tags: haskell, meta
---

A static website cannot have a contact form because this is dynamic.
I'm quite keen for this site to have a contact form because in my
experience people are more likely to use a contact form than a mailto:
link. There might be something to be said about a higher quality of 
response from email links, but I'd rather get as many enquiries through
as possible and then worry about the quality on this end. In the unlikely
event of my being swamped by the vast number of people using the contact
form I'll reconsider.

So, I need a dynamic part of a static website. This is pretty easy to setup
in nginx:

    server {
       listen 80;
       server_name www.eanalytica.com;

       location /post {
         proxy_pass         http://127.0.0.1:4001;  
       }

       location / {
         root /var/www/eanalytica/www;
         index index.html;
      }
    }

This will pass any requests to /post onto my contact form handler which runs
on port 4001.

Now for the handler itself. This post is literate haskell so you can copy and 
compile the whole thing as it is.

First we use the OverloadedStrings language extension that makes working with 
Data.Text so much easier.

> {-# LANGUAGE OverloadedStrings #-}

Now the imports. We use Warp and Wai do define and run the interface. I could 
go straight to WAI from nginx using fastcgi or similar but I find Warp easier
to work with.

> import Network.Wai
> import Network.Wai.Handler.Warp

Network.Wai.Parse is a useful module for working with POST requests found in the
wai-extra package.

> import Network.Wai.Parse

> import Network.HTTP.Types
> import qualified Data.ByteString.Lazy.Char8 as C
> import qualified Data.Text as T

This is the first time I've used lazy text. It is needed here because it is expected
as part of the mail message

> import qualified Data.Text.Lazy as L

We decode Text from Bytestrings. The Data.Text.Encoding modules provide the functions
needed to do this safely

> import Data.Text.Encoding
> import Data.Text.Encoding.Error

liftIO is needed to perform standard IO actions within the ResourceT monad.

> import Control.Monad.IO.Class (liftIO)

Finally, we need Network.Mail.Mime to email the submitted contact form to me.

> import Network.Mail.Mime

The main function runs the app on port 4001.

> main = run 4001 app

The app takes a request as input and returns the response.

> app rq = do
  
parseRequestBody returns the POST parameters and any files submitted for upload.  
The backend argument says where to store and uploaded files. In this case we specify 
"lbsBackend" meaning store them in memory. This will never be used because we take only
the first value of the result: The parsed POST parameters. 
  
>   parsed <- fmap fst $ parseRequestBody lbsBackEnd rq

To make the email message we use the makeMail function. For some reason this is in the
IO monad

>   mail <- liftIO $ makeMail parsed

Then we send the email. I have to use renderSendMailCustom because my system has the
sendmail binary in /usr/bin rather than /usr/sbin. You get an Error 127 if you get this
wrong.

>   liftIO $ renderSendMailCustom "/usr/bin/sendmail" ["-t"] mail

Finally, return the response.

>   return $ responseLBS status200 [] $ C.pack "Done"

The makeMail function takes the (key,value) pairs from the post request and makes an email
out of them.
  
> makeMail content = simpleMail toAddress fromAddress "E-Analytica Contact Form" message L.empty []
>   where toAddress = Address Nothing "contact@eanalytica.com"
>         fromAddress = Address (Just "E-Analytica Contact") "contact@eanalytica.com"

Decode the bytestrings into Text.

>         decode = decodeUtf8With lenientDecode
>         decodedContent = map (\(x,y) -> (decode x, decode y)) content 

Then transform the text into an email.

>         listedContent = T.concat $ map (\(x,y) -> T.concat [x, ": ", y, "\n\n"]) decodedContent
>         message = L.fromChunks ["The E-Analytica contact form has been submitted:\n\n",
>                             listedContent
>                             ]

This service return the string "Done" on successful submission so submitting the form directly isn't
great user experience.

Instead the form submission is handled using javascript:

    $(document).ready(function() {
        $('form[action="/post"]').submit(function() {
            var form = this;
            $(form).prepend('<img src="/img/loader.gif" />')
            var d = $(form).serialize();
            $.post('/post',d,function(){
                $(form).replaceWith('<p>Your message has been sent.</p>');
            }).error(function() {
                $(form).replaceWith('<p>There was an error submitting the form. Please email <a href="mailto:contact@eanalytica.com">contact@eanalytica.com</a> instead</p>');
            });
            return false;
        });
    });
                            