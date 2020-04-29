---
title: Covid Forecast Examples
---

This post looks at a few different things you might see when using the [Covid
Forecasting Tool](https://www.eanalytica.com/forecasting/covid/) and explains how
to interpret them. I've been getting a few questions about output from the tool
and I want to consolidate and expand on my answers here.

## Example 1: When it mostly works first time

First let's look at a nice example where everything works and things are easy to
interpret. Here is a chart of the raw data:

![Data since 1st October 2019](/files/Covid-Plot-1.png)

First we look at the impact plot which uses the data up to the date of lockdown
to make a forecast. If the actual data since lockdown is very different to the
forecast then it is reasonable to conclude that lockdown has had an impact.

![Impact Plot](/files/Covid-Plot-2.png)

You can see that what actually happened (the black line) is very different from
what was predicted to happen if lockdown did not occur (the blue line). It is
far outside the green zone of "stuff we could reasonably expect to happen";
there is less than a 5% chance of seeing what you actually saw if the
forecasting model is correct.

Indeed, Google's `CausalImpact` method says there is a 99.9% probability of a
causal effect! (This effect *might* not be lockdown, but it did happen on 24th
March).

Let's proceed with the analysis and see what we can say about current trends.

The next part of our process analyses the underlying trend in the metric and
looks for points at which the trend changes.

The following three plots are all different ways of visualising this.

![Trend Plot](/files/Covid-Plot-5.png)

The chart above shows the underlying trend. It drops (a lot!) around lockdown but
then seems to be rising again early in April.

![Deltas Plot](/files/Covid-Plot-3.png)

The "deltas" plot shows the size of the trend change. There are two small, positive deltas
(black lines) happening after lockdown which shows the trend has changed in an
upwards direction since 24th March.

![Trend Slope Plot](/files/Covid-Plot-4.png)

The trend slope is the number of extra sessions (or whatever metric you choose)
per day you can expect compared to the day before, after allowing for weekly and
annual seasonality. Around lockdown the slope went very negative; each day was
worse than the previous one. But in early April is began moving upwards again
and is now above zero; you can expect this metric to keep growing over the
coming weeks.

This is a nice example of things all working out really well which makes things
dead easy to interpret. Most things in the real world are less clear cut as the
next examples show.

## Example 2. Lockdown when?
What the hell is going on here?

![Impact Plot](/files/Covid-Plot-7.png)

Looking at the raw data over a longer period of time helps:

![Data since 1st October 2019](/files/Covid-Plot-6.png)

There has clearly been *something* going on with this site. But the first plot
is showing us that what we are currently seeing is within the 95% range of what
would have happened if there had been no lockdown.

Part of the problem is that, for this site, the changes started happening for
them before the UK lockdown on the 24th March. Even for a UK site this is a
common pattern. Changing the lockdown date to the 16th March produced the
following impact plot instead:

![Impact Plot](/files/Covid-Plot-8.png)

This is a bit more like what we would expect. It shows the impact of whatever
started happening on the 16th March as having an impact on the metric; this is
the difference between the blue and the black lines. The forecast (blue line)
also looks more reasonable than in the first chart; here it seems to continue on
from the previous values rather than popping up out of nowhere.

However, it is still not that simple! The green 95% predictive interval overlaps
the black line which means that on any given day there is >5% chance that we are
observing something that has nothing to do with changes on March 16th. 

I'm not that interested in what might happen on any given day, some days are bad
days and some days are good days. When **all** the days are within the 95%
interval and all the days are on the same side of it (the low side) this can
still mean there is a very high chance of an effect even if the chance for a
single day is small.

You can draw a cumulative impact chart to see this.

![Cumulative Impact](/files/Covid-Plot-9.png)

This plot isn't part of the forecasting tool at the moment but I'm thinking of
adding it in.

It clearly shows the impact of the 16th March. There is a 97.5% probability of a
causal effect.

Another problem is that the model doesn't know any of the constraints on the
value of a metric. For example sessions cannot be less than zero and bounce
rates must be between zero and 100 percent. You can see this in the first impact
plot where the green area suggests there is a chance it might be negative even
though in the real world this is impossible.

I have a fix in the pipeline for this; it will probably only be for a small
number of commonly used metrics but that will be better than nothing. Give me
your email address if you want an update when I do this:

<form action="https://formspree.io/mdolqwbk" method="POST">
  <input type="email" name="email" placeholder="Email">
  <input class="btn-sm btn-b btn" type="submit" value="Send">
</form>

### Trends

What does the trend analysis say for this data?

Nothing good I'm afraid:

![Trend Plot](/files/Covid-Plot-10.png)

![Deltas Plot](/files/Covid-Plot-11.png)

![Trend Slope](/files/Covid-Plot-12.png)

For this site, they have been hit hard before the official lockdown even
happened and there are no signs of any recovery yet. If I had a bit more time
I'd do more analysis on finding the best date to say "it all started to go wrong
here"; it looks to me like things might have been heading South even before the
16th March. Although, of course, the further back you look for these things the
more likely it is that something other than COVID-19 is the cause.

## A success story

Just looking at the next chart with the mark 1 human eyeball is enough to tell
this is a very different story from our previous example.

![Data since 1st October 2019](/files/Covid-Plot-13.png)

It looks like there might be a positive trend from February onwards. The
questions here are more about whether or not lockdown had a positive impact and
if that impact is sustained rather than temporary.

![Impact Plot](/files/Covid-Plot-14.png)

There is a 99.9% probability of a causal effect and this effect is positive.
This isn't surprising; just looking at the chart and not worrying about the
statistics will tell you the same thing!

![Trend Plot](/files/Covid-Plot-15.png)

![Deltas Plot](/files/Covid-Plot-16.png)

The deltas plot shows that, starting in early April, there were some negative
changes to the trend slope. This could mean it starts decreasing or it could
just mean it isn't increasing so fast.

![Trend Slope Plot](/files/Covid-Plot-17.png)

Looking at the values of the trend gradient this shows that after rapid growth
in the runup to lockdown things might be returning to normal for this site.

## Thank you
Big thanks to [Dipesh Shah](https://twitter.com/mrdipeshashah) and other
(anonymous) contributors who agreed that their data could be shared in this
post.
