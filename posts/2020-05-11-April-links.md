---
title: Links from April
---

A lot of my headspace has been taken up with coronavirus related thinking of
late. I'm sure it is the same for many of you too!

At the end of March I was worried about the number of cases overwhelming the ICU
capacity; it seems we have done social distancing well enough to avoid this
although I don't want to call it a success when the number of deaths in the UK
is so much higher than other nearby countries.

These days I worry about the following:

1. Does our higher death rate now mean we are less likely to have a bad second
   wave? I think it does although "less likely" is doing a lot of work in that
   question; the precise amount of likeliness is what's important.
2. How long will the post lockdown recession last? There are a lot of people on
   full pay who haven't been spending much money, but I don't think this is
   enough to balance out those who have been furloughed or lost their jobs.
3. When can I start doing sport again? I know I'm allowed to exercise (and I'm
   very grateful for this - and Italian style lockdown would be **much** harder
   for me) but this doesn't quite do everything sport does for me.
   
I've split the following links into COVID links where the topic is mostly about
coronavirus and other links. The other links are mostly COVID adjacent because
that is the world we live in now but aren't *mainly* to do with the virus.

## COVID-19 Links

### Modelling epidemics with Stan
There has been a bit of a twitter pushback against armchair epidemiology on
Twitter saying it does more harm than good but I have decided I quite like it:

1. The culture of learning in the open is valuable. I'm not reading these
   blogposts expecting them to tell me "everything I need to know" about disease
   modeling; I am interested to see how others learn
2. Simpler models are easier to understand whilst still showing important
   aspects of the dynamics
3. "Official" epidemiologists don't seem to have done so well at forecasting
   this so I think the argument that other people's approaches cause harm is
   weaker than I first thought.
   
[Estimating transmission by fitting mechanistic models in
Stan](https://jrmihalj.github.io/estimating-transmission-by-fitting-mechanistic-models-in-Stan/)
is a nice introduction to fitting SIRS models (I studied these briefly at
university). I've been looking for a nice guide on how to solve ODE systems with
Stan for a while so I'm quite pleased to have found one.

[Discrete Time Transmission Models in
Stan](https://rstudio-pubs-static.s3.amazonaws.com/270496_e28d8aaa285042f2be0c24fc915a68b2.html)
shows a different approach without needing to solve differential equations; I
find this approach appealing because I can kind of see how it could be modified
to make a more customised model.

I was asked on Twitter about my own armchair forecasts:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I&#39;d love to see whatever u do.</p>&mdash; dan barker (@danbarker) <a href="https://twitter.com/danbarker/status/1243942101504724993?ref_src=twsrc%5Etfw">March 28, 2020</a></blockquote>

At the time I was hesitant to dive in because of the hate for amateur analysis
of this kind of thing. Since then I've thought about trying something with the
above two approaches but I have not got anywhere because I think the number of
cases has as much to do with local testing regimes as it does with the actual
prevalence of the disease. It would be very interesting to model this by taking
into account different testing procedures across different nations but this
would be a lot of work.

### [First experience of COVID-19 screening of health-care workers in
England](https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30970-3/fulltext)

Newcastle hospitals seem to have been luckier than most during this outbreak.
There has generally been enough PPE and, as the link discusses, enough testing
capacity for staff.

> Since March 10, 2020, the Newcastle upon Tyne Hospitals National Health
> Service (NHS) Foundation Trust has been screening symptomatic health-care
> workers for severe acute respiratory syndrome (SARS) coronavirus 2
> (SARS-CoV-2). Our decision was based on the following rationale: to maintain
> the health and welfare of our staff; to enable rapid identification and
> isolation of infected health-care workers so as to protect patients and the
> wider community, given that nosocomial transmission has been recognised as an
> important amplifier in epidemics of both SARS and Middle East respiratory
> syndrome; and to enable more rapid return to work of staff during this
> challenging period for the NHS. Importantly, we judged that we had sufficient
> capacity within our service to absorb this additional testing.

Most interesting is that they have been able to measure a change in how the
disease spreads post lockdown; before lockdown an exponential curve fits best.
After lockdown growth is linear (still fast, but no where near exponential).

![A change in how the disease spreads post lockdown](/files/2020-04-11-covid-chart.png)

This data is not from a representative sample of the population but it does show
lockdown having an effect even among a population with high exposure to the
disease (medical staff).

### [COVID-19 and the basics of democratic
governance](https://www.nuffieldbioethics.org/news/statement-covid-19-and-the-basics-of-democratic-governance) 

It feels like this link has kind of been overtaken by events; clear
communication! After Sunday!

> The UK Government’s communication with the public has been admirably clear and
> simple: stay home. But it has been one-dimensional and one directional, whilst
> the challenges presented by COVID-19 are multiple, and they are far from
> simple.

> “We are following the science” is the supposedly reassuring message. But
> following the science is not politically or morally neutral. Every scientist
> will tell you that science does not provide certainty (and is usually
> contested); and it does not deliver policy answers – that involves values and
> judgements for which people are responsible and should be scrutinised, and
> accountable. Which values are in play and what judgements are being made? By
> whom? On what advice?

I strongly agree with the above. "We followed the science" is useless and,
worse, is part of the creeping "scientism" of daily life. I think science is
great but it is not useful when it becomes a cargo cult.

And by writing "science is great!" I'm participating in, and making this trend
worse. AAAARRGH.

## Other Stuff

### Reproducible Machine Learning
I've been bitten by this a couple of times in the past where accuracy in the
production version of a model has been different to the accuracy of the
development version. Or the accuracy of something trained "live" in front of
someone is different to the number you emailed them the previous week.

Even if the accuracy number improves, this is still the kind of thing that ruins
client confidence.

This kind of thing is also apparently a problem for Neil Ferguson's model of the
epidemic. I'd like to think that if I was doing some modelling of that level of
importance I'd make sure I got all the basic things right. But if I was rushing
to finish a Phd, then making a few code adjustments for a new paper and
repeating that for 15 years I am very sure the state of my code would be awful.

Joel Grus has [some
advice](https://docs.google.com/presentation/d/1yHLPvPhUs2KGI5ZWo0sU-PKU3GimAk3iTsI38Z-B5Gw/edit#slide=id.p)
on making machine learning models reproducible and there is a more in depth look
at some of the ideas
[here](https://app.wandb.ai/sayakpaul/reproducible-ml/reports/Reproducible-Models-with-W%26B--Vmlldzo3ODMxNQ)

Three things that I wasn't aware of that lead to a lack of reproducibility with
Keras/NN:

1. Tensorflow needs it's own random seed set using tf.random.set_seed. The usual
   python random.seed won't work by itself.
2. Train/test splits at random will lead to different scores on the test data
   depending on which samples end up there
3. You can end up with quite different end results depending on the initial
   weights that the network starts with. The inital weights are normally picked
   at random.

### [Don't waste the COVID-19 Reboot](https://yakcollective.org/projects/yak-wisdom)
Tom Critchlow introduced me to the idea of "indie consulting" with his writings
on his blog. I'm not sure whether my work falls into this category or not; I
call myself an "**Independent Data Science Consultant**" but I rarely draw a
2x2. It feels like there is a lot for me to learn from these type of thing but
it all feels rather distant from my current state.

Certainly positioning myself against the big four management consultancies would
be excellent for my bank balance if it worked. The question for me to answer is
"why not" and then look at how feasible it is to fill the holes in my offering.

### The single most humiliating rapper origin story imaginable
> As his parents pulled into the driveway, Jack Harlow had a question from the
> backseat. He was 12. “Mom,” he said, “how do I become the best rapper in the
> world?” His mother had just read the book Outliers, which popularized the
> theory that the secret to greatness is 10,000 hours of practice. With Jack’s
> 18th birthday as a deadline, she did the math. For the next six years, her son
> would need to work on rapping for four or five hours every day. “OK,” Jack
> said.

From [How Jack Harlow Became Louisville’s Most Famous Rapper](https://www.louisville.com/content/kid-mic)


