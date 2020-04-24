---
title: Making E-Analytica Forecasting
---

[E-Analytica Forecasting](/forecasting/covid) launched publicly on Monday. It has been a moderate
success, at least compared to most of my efforts, with over 150 analyses being
conducted since than (not all of them by me!).

### Initial Motivation
When doing a forecasting project the value I add comes from customising machine
learning models to take into account specifics of the client's business. But to
quantify how much value I'm adding it is necessary to have a baseline to compare
with.

Often I would pick a very simple model and run it over the training data to get
baseline performance. But there are more complicated models that are just as
easy to run as the simple ones so I worried that I was picking a baseline that
was, in some way, too easy for me to beat.

I wanted a way of running lots of forecasting models at once and to be able to
compare the output in a standard way. This is quite easy for forecasting methods
that are part of the `forecast` package but once you add things like `bsts` and
`prophet` into the mix this gets more complicated.

I had some functions written to help me do this when (as part of something
unrelated) [Mark Edmondson](https://www.twitter.com/HoloMarkeD) pointed out
[Google Cloud Run](https://cloud.google.com/run) to me. I spotted this as an
opportunity to run my forecasts in the cloud; everything would automatically be
in parallel, it might be useful for getting people up and running in
[training](/training/) more easily, **and** I'd get to learn a new technology too!

### Web Frontend
Cloud Run was pleasantly easy to get started with. I was able to turn my old
functions into HTTP endpoints using a library called `plumber` and then it was
simply a case of wrapping the whole thing in Docker so that it could run in the
cloud.

Cloud Run exposes things as HTTP so once I had things up and running it was a
natural next step to start thinking about whether or not it could be used from a
web browser.

`Shiny` is an obvious choice for any kind of web interface to R but I didn't
want to use it for this project for three reasons:

1. Hosting Shiny apps can be quite tricky. To make things more complicated I
   wanted the app to be a part of this website which is a static site hosted
   through Amazon S3 - there isn't a webserver to hook in with.
2. When you are on the golden path `shiny` is A-MA-ZING but as soon as you want
   to do anything even slightly different it gets very hard. I anticipated not
   wanting to stay on the golden path for very long.
3. `Shiny` communicates with the backend process over websockets and I wasn't
   sure how to do this with Cloud Run

I built quite a simple (simple to make, not simple to use!) interface in front
of the HTTP API using [Elm](https://elm-lang.org/) which enabled people to
compare the performance of different forecasting methods on their own data. 

Elm did not make integrating with Google Sign In and the Google Analytics API
super easily but I got something working in the end so that data can be pulled
directly from Analytics. You can see this in action [here](/forecasting/).

I showed this to some people to see what they thought. Mostly the feedback was
"I'm sure this is cool, if you know what it all means". There was a big gap
between what I had built for myself and what others could easily use. I thought
my tool would probably be pretty useful during forecasting training sessions
where I could be there to explain everything but I was at a bit of a loss how to
make the tool easy enough to understand without covering the whole thing in
dense text. People don't read on the internet.

### COVID-19
While all this was going on there was quite a lot happening in the outside
world!

The UK lockdown on March 24th was catastrophic for some (but not all!)
businesses. A lot of plans and activities were put on hold as everyone focused
on hunkering down and surviving. During these times a natural question is "how
much longer?" I cannot answer this is full but I did notice that it would be
possible to repurpose some of my forecasting tools to answer the related
question "are things getting better?"

I wanted to make this as quick and simple to use as possible so I only offered
the link with Google Analytics and no other way to input data.

I the background, data is fed into `prophet` but rather than using this to
produce a forecast the model is used find out if the trend has changed since
lockdown. You can find this tool [here](/forecasting/covid/)

### API
One of the first people to get in touch when I launched on Monday was asking if
translation into Polish was on my roadmap. It was not. An localisation of a web
app feels like it is well beyond my skillset! I still wanted to help Maciej so I
decided to document the HTTP API that runs the backend so that he could present
the results in his own language. You can read the [API
documentation](/forecasting/api/) here.

Having an API opens up two potentially bad outcomes:

1. People will be able to make tens of thousands of requests. If this happened a
   lot it would increase my compute costs significantly.
2. People might make something important with the API. And then I would break it
   if I ever changed anything.
   
Both of these are actually good things! I'd love it if people built something
important off my work. But in order to mitigate the potential downsides I
decided to require the use of an API key in order to use the API. The keys are
linked with email addresses so I will be able to contact people in the event the
API changes.

### What Next?
I'm not sure! If you have feedback on the [COVID](/forecasting/covid/) tool then
I'd love to hear it. I know I need to make sure things are better explained so
that *everyone* who uses it can feel confident and like they understand what is
going on. Machine learning should be empowering rather than something where
"computer says no" and people feel like they have lost some agency and control
over their work.

I'm also going to keep working on my frontend for comparing forecasting models.
I think if I get this right it could be a great way for analysts to do more
sophisticated forecasting with a bit more hand holding than they get when
staring at a blank R file.

## Technologies
+ R is used to make forecasts using some of the defaults from the `forecast`
  library as well as `prophet` and `bsts`
+ Outputs from the forecast functions are standardised to make them easy to
  compare and so that things like time series cross validation can be done in a
  standardised way
+ The `plumber` library is used to turn the above into an HTTP API
+ Everything is wrapped up in a Docker image which Google can use on Cloud Run.
  I think speed could be improved if I can get the image size smaller, but this
  is not a priority for now.
+ The frontend is written in Elm. I've done some small projects in Elm before
  (e.g. [my ad testing game](/ad-testing/)). I find it easy to work with because
  it is similar to Haskell which is the first programming language I learned.
  [Purescript](https://www.purescript.org/) is another option that I considered
  but I thought I was spending enough of my [novelty
  budget](https://www.shimweasel.com/2018/08/25/novelty-budgets) already.
+ The frontend is a single page app that sits in a subfolder of this site. I
  needed a way to pass control of anything in the /forecasting/ folder to the
  app because, by default, requests to things like /forecasting/api/ would 404
  because there is no /forecasting/api/index.html file. I was able to do this
  using AWS lambda

