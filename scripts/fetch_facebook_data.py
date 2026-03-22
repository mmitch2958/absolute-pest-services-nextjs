#!/usr/bin/env python3
"""
fetch_facebook_data.py — Pull Facebook Page + Instagram metrics via Graph API
Saves to (MARKETING_DATA_DIR env var, or <project-root>/data/marketing/ by default):
  - facebook_metrics_YYYY-MM-DD.json
  - instagram_metrics_YYYY-MM-DD.json

Cron: run every morning, e.g. 0 7 * * * /usr/bin/python3 /path/to/fetch_facebook_data.py

SETUP (Lando):
  1. Go to https://developers.facebook.com → Create or use existing App
  2. Add the "Pages API" product to the app
  3. Generate a long-lived Page Access Token:
     a. Get User Token with pages_read_engagement + pages_show_list + instagram_basic + instagram_manage_insights permissions
     b. Exchange for Long-Lived Token via /oauth/access_token?grant_type=fb_exchange_token
     c. Use Long-Lived Token to get Page Token: GET /{page-id}?fields=access_token
  4. Export FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID in environment (or add to .env)
  5. Token expires every 60 days — set a calendar reminder to refresh

PERMISSIONS NEEDED:
  - pages_read_engagement  — post reach, reactions, comments
  - pages_show_list        — enumerate pages
  - read_insights          — page-level insights (fans, impressions)
  - instagram_basic        — Instagram profile + media
  - instagram_manage_insights — Instagram insights (reach, engagement)

NOTE: Basic display data (fan count, posts) is free.
      Detailed insights require the Page to have 100+ fans.
"""

import json
import os
import sys
from datetime import date, datetime, timedelta

import requests

# ── Config ──────────────────────────────────────────────────────────────────
FB_PAGE_ACCESS_TOKEN = os.environ.get('FB_PAGE_ACCESS_TOKEN', '')
FB_PAGE_ID           = os.environ.get('FB_PAGE_ID', '')

DATA_DIR = os.environ.get(
    'MARKETING_DATA_DIR',
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'marketing')
)

GRAPH_URL = 'https://graph.facebook.com/v21.0'

# ── Helpers ──────────────────────────────────────────────────────────────────

def graph_get(endpoint: str, params: dict) -> dict:
    """Make an authenticated GET request to the Facebook Graph API."""
    params['access_token'] = FB_PAGE_ACCESS_TOKEN
    url = f'{GRAPH_URL}/{endpoint}'
    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code != 200:
        print(f'[fetch_facebook_data] ERROR {resp.status_code} @ {endpoint}: {resp.text[:300]}')
        resp.raise_for_status()
    return resp.json()


def fetch_page_info() -> dict:
    """Fetch page summary: name, fan count, follower count, linked IG account."""
    return graph_get(
        FB_PAGE_ID,
        {'fields': 'name,fan_count,followers_count,category,instagram_business_account'}
    )


def fetch_page_insights() -> dict:
    """
    Fetch page-level insights for the past 7 days:
    - page_impressions_unique — reach (unique accounts)
    - page_post_engagements   — likes + comments + shares
    - page_fan_adds_unique    — new fans
    """
    since = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
    until = date.today().isoformat()

    try:
        return graph_get(
            f'{FB_PAGE_ID}/insights',
            {
                'metric': ','.join([
                    'page_impressions_unique',
                    'page_post_engagements',
                    'page_fan_adds_unique',
                ]),
                'period': 'day',
                'since':  since,
                'until':  until,
            }
        )
    except Exception as e:
        print(f'[fetch_facebook_data] Insights fetch failed (may need 100+ fans): {e}')
        return {'data': []}


def fetch_recent_posts(limit: int = 10) -> list:
    """Fetch recent posts with engagement metrics."""
    since = int((datetime.utcnow() - timedelta(days=7)).timestamp())
    try:
        data = graph_get(
            f'{FB_PAGE_ID}/posts',
            {
                'fields': 'message,created_time,likes.summary(true),comments.summary(true),shares',
                'limit':  limit,
                'since':  since,
            }
        )
        return data.get('data', [])
    except Exception as e:
        print(f'[fetch_facebook_data] Posts fetch failed: {e}')
        return []


def fetch_ig_account_info(ig_account_id: str) -> dict:
    """Fetch Instagram Business Account info."""
    try:
        return graph_get(
            ig_account_id,
            {'fields': 'name,username,followers_count,media_count'}
        )
    except Exception as e:
        print(f'[fetch_facebook_data] IG account info failed: {e}')
        return {}


def fetch_ig_insights(ig_account_id: str) -> dict:
    """Fetch Instagram account-level insights for the past 7 days."""
    since = int((datetime.utcnow() - timedelta(days=7)).timestamp())
    until = int(datetime.utcnow().timestamp())

    try:
        return graph_get(
            f'{ig_account_id}/insights',
            {
                'metric': ','.join([
                    'impressions',
                    'reach',
                    'profile_views',
                ]),
                'period': 'day',
                'since':  since,
                'until':  until,
            }
        )
    except Exception as e:
        print(f'[fetch_facebook_data] IG insights fetch failed: {e}')
        return {'data': []}


def fetch_ig_recent_media(ig_account_id: str, limit: int = 10) -> list:
    """Fetch recent Instagram posts with engagement metrics."""
    since = int((datetime.utcnow() - timedelta(days=7)).timestamp())
    try:
        data = graph_get(
            f'{ig_account_id}/media',
            {
                'fields': 'caption,timestamp,like_count,comments_count,media_type,permalink',
                'limit':  limit,
                'since':  since,
            }
        )
        return data.get('data', [])
    except Exception as e:
        print(f'[fetch_facebook_data] IG media fetch failed: {e}')
        return []


# ── Parsers ──────────────────────────────────────────────────────────────────

def parse_page_metrics(page: dict) -> dict:
    return {
        'page_name':       page.get('name', ''),
        'category':        page.get('category', ''),
        'fan_count':       page.get('fan_count', 0),
        'followers_count': page.get('followers_count', 0),
        'has_ig':          bool(page.get('instagram_business_account')),
        'ig_account_id':   page.get('instagram_business_account', {}).get('id', ''),
    }


def parse_insights(raw_insights: dict) -> dict:
    """Sum up 7-day totals from insights response."""
    totals: dict = {}
    for metric_data in raw_insights.get('data', []):
        name   = metric_data.get('name', '')
        values = metric_data.get('values', [])
        total  = sum(v.get('value', 0) for v in values if isinstance(v.get('value'), (int, float)))
        totals[name] = total
    return totals


def parse_post_metrics(posts: list) -> dict:
    """Aggregate engagement from recent posts."""
    if not posts:
        return {
            'post_count_7d':  0,
            'total_likes':    0,
            'total_comments': 0,
            'total_shares':   0,
            'recent_posts':   [],
        }

    total_likes    = sum(p.get('likes',    {}).get('summary', {}).get('total_count', 0) for p in posts)
    total_comments = sum(p.get('comments', {}).get('summary', {}).get('total_count', 0) for p in posts)
    total_shares   = sum(p.get('shares',   {}).get('count', 0) for p in posts)

    # Parse individual post details
    recent_posts = []
    for p in posts[:5]:
        recent_posts.append({
            'message':    p.get('message', '')[:200],  # Truncate long messages
            'created_at': p.get('created_time', ''),
            'likes':      p.get('likes', {}).get('summary', {}).get('total_count', 0),
            'comments':   p.get('comments', {}).get('summary', {}).get('total_count', 0),
            'shares':     p.get('shares', {}).get('count', 0),
        })

    return {
        'post_count_7d':  len(posts),
        'total_likes':    total_likes,
        'total_comments': total_comments,
        'total_shares':   total_shares,
        'recent_posts':   recent_posts,
    }


def parse_ig_insights(raw_insights: dict) -> dict:
    """Parse Instagram account insights."""
    result = {}
    for metric_data in raw_insights.get('data', []):
        name = metric_data.get('name', '')
        values = metric_data.get('values', [])
        total = sum(v.get('value', 0) for v in values if isinstance(v.get('value'), (int, float)))
        result[name] = total
    return result


def parse_ig_media(media_list: list) -> list:
    """Parse individual Instagram media items."""
    items = []
    for m in media_list[:5]:
        items.append({
            'caption':      m.get('caption', '')[:200],
            'timestamp':    m.get('timestamp', ''),
            'like_count':   m.get('like_count', 0),
            'comment_count': m.get('comments_count', 0),
            'media_type':   m.get('media_type', ''),
            'permalink':    m.get('permalink', ''),
        })
    return items


def save(data: dict, filename: str) -> str:
    os.makedirs(DATA_DIR, exist_ok=True)
    fpath = os.path.join(DATA_DIR, filename)
    with open(fpath, 'w') as f:
        json.dump(data, f, indent=2)
    return fpath


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    today = date.today().isoformat()
    print(f'[fetch_facebook_data] Starting — {today}')

    if not FB_PAGE_ACCESS_TOKEN or not FB_PAGE_ID:
        print('[fetch_facebook_data] PLACEHOLDER MODE — credentials not configured.')
        print('  Set FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID to enable live data.')

        placeholder = {
            'fetched_at':      today,
            'platform':        'facebook',
            'page_id':         'NOT_CONFIGURED',
            'status':          'placeholder',
            'account_metrics': {
                'page_name':       '',
                'category':        '',
                'fan_count':       0,
                'followers_count': 0,
            },
            'engagement_7d': {
                'post_count_7d':           0,
                'total_likes':             0,
                'total_comments':          0,
                'total_shares':            0,
                'page_impressions_unique': 0,
                'page_post_engagements':   0,
                'page_fan_adds_unique':    0,
            },
            'recent_posts': [],
        }
        fpath = save(placeholder, f'facebook_metrics_{today}.json')
        print(f'[fetch_facebook_data] ✓ Placeholder saved → {fpath}')

        # Also save Instagram placeholder
        ig_placeholder = {
            'fetched_at':      today,
            'platform':        'instagram',
            'status':          'placeholder',
            'account_metrics': {
                'username':       '',
                'name':           '',
                'followers_count': 0,
                'media_count':    0,
            },
            'engagement_7d': {
                'impressions':    0,
                'reach':          0,
                'profile_views':  0,
            },
            'recent_posts': [],
        }
        ig_fpath = save(ig_placeholder, f'instagram_metrics_{today}.json')
        print(f'[fetch_facebook_data] ✓ IG Placeholder saved → {ig_fpath}')
        return placeholder

    try:
        page     = fetch_page_info()
        insights = fetch_page_insights()
        posts    = fetch_recent_posts()
    except Exception as e:
        print(f'[fetch_facebook_data] FATAL: {e}')
        sys.exit(1)

    account_metrics = parse_page_metrics(page)
    insight_totals  = parse_insights(insights)
    post_metrics    = parse_post_metrics(posts)

    # Separate recent_posts from engagement totals
    recent_posts = post_metrics.pop('recent_posts', [])
    engagement_7d = {**post_metrics, **insight_totals}

    fb_output = {
        'fetched_at':      today,
        'platform':        'facebook',
        'page_id':         FB_PAGE_ID,
        'status':          'live',
        'account_metrics': account_metrics,
        'engagement_7d':   engagement_7d,
        'recent_posts':    recent_posts,
    }

    fpath = save(fb_output, f'facebook_metrics_{today}.json')
    print(
        f'[fetch_facebook_data] ✓ Facebook saved → {fpath}\n'
        f'  Fans: {account_metrics["fan_count"]:,}  |  '
        f'Posts (7d): {post_metrics["post_count_7d"]}  |  '
        f'Likes: {post_metrics["total_likes"]}'
    )

    # ── Instagram (if linked) ────────────────────────────────────────────────
    ig_account_id = account_metrics.get('ig_account_id', '')
    if ig_account_id:
        print(f'[fetch_facebook_data] Found linked IG account: {ig_account_id}')
        try:
            ig_info    = fetch_ig_account_info(ig_account_id)
            ig_ins     = fetch_ig_insights(ig_account_id)
            ig_media   = fetch_ig_recent_media(ig_account_id)

            ig_account_metrics = {
                'username':        ig_info.get('username', ''),
                'name':            ig_info.get('name', ''),
                'followers_count': ig_info.get('followers_count', 0),
                'media_count':     ig_info.get('media_count', 0),
            }
            ig_insights = parse_ig_insights(ig_ins)
            ig_recent   = parse_ig_media(ig_media)

            ig_output = {
                'fetched_at':      today,
                'platform':        'instagram',
                'status':          'live',
                'account_metrics': ig_account_metrics,
                'engagement_7d':   ig_insights,
                'recent_posts':    ig_recent,
            }

            ig_fpath = save(ig_output, f'instagram_metrics_{today}.json')
            print(
                f'[fetch_facebook_data] ✓ Instagram saved → {ig_fpath}\n'
                f'  Followers: {ig_account_metrics["followers_count"]:,}  |  '
                f'Posts (7d): {len(ig_recent)}'
            )
        except Exception as e:
            print(f'[fetch_facebook_data] Instagram fetch failed: {e}')
            # Save a partial IG record
            ig_output = {
                'fetched_at':      today,
                'platform':        'instagram',
                'status':          'error',
                'error':           str(e)[:200],
                'account_metrics': {
                    'username': '', 'name': '', 'followers_count': 0, 'media_count': 0,
                },
                'engagement_7d': {},
                'recent_posts': [],
            }
            save(ig_output, f'instagram_metrics_{today}.json')
    else:
        print('[fetch_facebook_data] No linked Instagram Business Account found.')
        ig_output = {
            'fetched_at':      today,
            'platform':        'instagram',
            'status':          'not_linked',
            'account_metrics': {
                'username': '', 'name': '', 'followers_count': 0, 'media_count': 0,
            },
            'engagement_7d': {},
            'recent_posts': [],
        }
        save(ig_output, f'instagram_metrics_{today}.json')

    return fb_output


if __name__ == '__main__':
    main()
