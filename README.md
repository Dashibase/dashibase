<p align="center">
<img width="300" src="https://raw.githubusercontent.com/dashibase/dashibase/main/assets/dashibase-logo.png"/>
</p>

### Announcement: Dashibase Beta is [now free](https://medium.com/dashibase/we-got-3-paid-signups-within-a-week-of-launching-then-we-refunded-them-and-made-dashibase-free-8a9e7c4b744a)!

Come hang out with us in our cozy Slack community [here](https://join.slack.com/t/dashibase-community/shared_invite/zt-180rycyqv-ifRwyiQAiXUlBBVxgxQE7g) 🤗

# Dashibase

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Just%20found%20out%20about%20Dashibase%20-%20a%20super%20simple%20way%20to%20build%20dashboards%20for%20Supabase%20users!&url=https://dashibase.com) [![We're open for beta!](https://img.shields.io/badge/We're%20open%20for%20beta!-Join-%2322c55e)](https://dashibase.com#join-beta) [![GPL-3.0](https://img.shields.io/github/license/dashibase/dashibase)](https://github.com/Dashibase/dashibase/blob/main/LICENSE)

**[Dashibase](https://dashibase.com) is a no-code tool to build user dashboards supported by Supabase.**

This repo contains the open-source code for setting up your own Dashibase dashboard if you are interested in hosting it yourself.

Contributions welcome!

**Have suggestions for what to work on next? Support us by joining our [beta](https://dashibase.com#join-beta)!**

---

## Features

This is a work-in-progress but the following features are already supported.

- [x] Authentication UIs including sign in and sign up - currently with email and password, third-party provider support coming soon
- [x] Multiple display modes - [`single`](https://dashibase.com/demo/profile), [`list`](https://dashibase.com/demo/todo), [`card`](https://dashibase.com/demo/notes)
- [x] CRUD functions
- [x] Simple form validation during item creation by checking that required fields are filled in (required attributes are configured in `src/dashibaseConfig.ts`)
- [x] Caching of dashboard data to reduce database queries and improve latency
- [x] Dashboard is responsive and works on tablet and mobile

![Dashibase Dashboard](https://raw.githubusercontent.com/dashibase/dashibase/main/assets/dashibase-screenshot.png)

## Getting Started

**1. Clone this repository and go to the Dashibase directory**

```bash
git clone https://github.com/dashibase/dashibase
cd dashibase
```

**2. Edit `src/dashibaseConfig.ts` to configure your dashboard.**

See [here](https://github.com/dashibase/dashibase/blob/main/src/dashibaseConfig.ts) for documentation on the config file.

**3. Test it locally**

We currently don't have a staging mode yet but you should be able to test it locally with your own account

```bash
npm run dev
```

**4. Deploy to your favorite server!**

**Important!** Remember to add your dashboard URL to your list of your sign-up redirect URLs in Supabase. You can find it at https://app.supabase.io/project/YOUR_PROJECT_ID/auth/settings.

## Like what you're seeing?

We're hoping to turn this into our full-time job! Support us by [joining our beta](https://dashibase.com#join-beta) and visit us in our Slack [here](https://join.slack.com/t/dashibase-community/shared_invite/zt-180rycyqv-ifRwyiQAiXUlBBVxgxQE7g) 🥰
