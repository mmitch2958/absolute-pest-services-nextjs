# Review Velocity Strategy — Absolute Pest Services

**Date:** 2026-03-19  
**Author:** Lando (Growth/Content Agent)  
**Purpose:** Strategy to increase Google review count and velocity

---

## Current State
- **Google Rating:** 5.0 stars
- **Review Count:** 156 reviews
- **Monthly Target:** 5 new Google reviews (60/year)

---

## 1. Automated Post-Service Email Sequence

### Touch 1: Day of Service (Immediate)
**Subject:** Thank you for choosing Absolute Pest Services!  
**Timing:** Within 1 hour of service completion  
**Content:**
- Thank the customer by name
- Recap the service performed
- Confirm satisfaction
- Soft ask: "We'd love to hear about your experience"
- Include review link (not embedded, plain URL)
- **No direct ask for review** — just ask if they're satisfied

### Touch 2: Day + 3 (Follow-Up)
**Subject:** How was your service experience?  
**Timing:** 3 days after service  
**Content:**
- Check in on satisfaction
- If problem: route to customer service
- If satisfied: **direct ask for Google review**
- Include clear CTA: "Leave us a review on Google"
- Include the direct Google review link
- Keep it short — 3-4 sentences max

### Touch 3: Day + 7 (Final Nudge)
**Subject:** Your feedback helps others find us  
**Timing:** 7 days after service  
**Content:**
- Last reminder for satisfied customers
- Emphasize how reviews help other homeowners
- Include Google review link
- Include opt-out/unsubscribe link
- **Stop sequence if review was left**

### Implementation Notes
- Use email automation (Mailchimp, SendGrid, or CRM)
- Segment: only send Touch 2 & 3 to customers who didn't flag dissatisfaction in Touch 1
- Track: open rates, click-through to review link, actual reviews posted
- A/B test subject lines quarterly

---

## 2. SMS Review Request (Twilio)

**Timing:** 2-3 hours after service completion  
**Message Template:**
```
Hi [Name]! Thanks for choosing Absolute Pest Services for your [service type] today. 

If you're happy with our work, would you mind leaving us a quick Google review? It really helps! 

[Short review link]

- The APS Team
Reply STOP to opt out.
```

**Best Practices:**
- Send only once per service visit
- Keep under 160 characters when possible
- Use a shortened Google review link (e.g., bit.ly/aps-review)
- Only send to customers who gave verbal/written positive feedback
- Comply with TCPA regulations
- Include opt-out mechanism

---

## 3. QR Code on Invoices

**Placement:**
- QR code in bottom-right corner of printed invoices
- QR code in footer of PDF invoices
- QR code on business cards handed out at service visits

**QR Code Destination:**
- Google review link (place ID URL)
- Use a redirect URL (e.g., absolutepestservices.com/review) for tracking

**Physical Materials:**
- Business card with QR code: "Scan to Leave a Review"
- Invoice footer: "Happy with our service? Scan to review us on Google!"
- Leave-behind magnet with QR code

---

## 4. Priority Platforms

| Platform | Priority | Action |
|----------|----------|--------|
| **Google Business Profile** | PRIMARY | All review requests should target Google |
| **Yelp** | SECONDARY | Mentioned in email but not primary CTA |
| **BBB** | SECONDARY | Maintain profile; don't actively solicit |
| **Facebook** | TERTIARY | Monitor but don't prioritize |

**Why Google First:**
- Drives local pack/map pack rankings
- Highest visibility for "near me" searches
- Reviews appear in search results
- Most trusted by consumers for local services

---

## 5. Review Response Templates

### Positive Review Response
**Template:**
```
Thank you so much for the wonderful review, [Name]! We're thrilled that [specific service] went well for you. Our team takes pride in providing [quality/humane/professional] pest control services. We appreciate your trust in Absolute Pest Services and look forward to serving you again if you ever need us. 🐛👍
```

**Customization Points:**
- Use reviewer's first name
- Reference the specific service mentioned
- Mention a specific team member if they named one
- Keep it warm and professional
- Respond within 24 hours

### Negative Review Response
**Template:**
```
[Name], we're sorry to hear about your experience. That's not the standard we hold ourselves to, and we want to make this right. 

We'd like to learn more about what happened and find a solution. Could you please call us directly at 484-643-2225 or email rob@absolutepestservices.com? 

We take all feedback seriously and are committed to resolving any issues. Thank you for bringing this to our attention.
```

**Key Principles:**
- Respond within 4 hours (business hours) or 12 hours (after hours)
- Never argue or get defensive
- Take the conversation offline
- Show genuine concern
- Offer specific contact methods
- Follow up internally to prevent recurrence

---

## 6. Monthly Review Targets

| Month | Target New Reviews | Cumulative Total |
|-------|-------------------|------------------|
| Month 1 (Apr) | 5 | 161 |
| Month 2 (May) | 5 | 166 |
| Month 3 (Jun) | 5 | 171 |
| Month 6 (Sep) | 5 | 186 |
| Month 12 (Mar 2027) | 5 | 216+ |

**Stretch Goal:** 200 reviews by end of 2026

---

## 7. Implementation Checklist

### Phase 1: Quick Wins (Week 1-2)
- [ ] Generate short Google review link
- [ ] Create QR code for review link
- [ ] Add review request to email signatures
- [ ] Update homepage review component with urgency messaging
- [ ] Create response templates in shared doc

### Phase 2: Automation (Week 3-4)
- [ ] Set up 3-touch email sequence in CRM/email platform
- [ ] Configure Twilio SMS for post-service review request
- [ ] Add QR code to invoice templates
- [ ] Create review tracking spreadsheet

### Phase 3: Optimization (Ongoing)
- [ ] Monthly review count tracking
- [ ] Quarterly email A/B testing
- [ ] Monitor and respond to all reviews within SLA
- [ ] Adjust messaging based on what's working

---

## 8. Tracking & Reporting

### Weekly Review Dashboard
- New reviews this week
- Average rating trend
- Response rate (did we respond to all?)
- Time to first response
- Review source (email vs SMS vs QR)

### Monthly Report
- New reviews vs target
- Net Promoter Score trend
- Common themes in reviews
- Response templates performance
- Recommendations for next month
