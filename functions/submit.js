export async function onRequestPost(context) {
  const body = await context.request.json();
  const ua = context.request.headers.get('User-Agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua) ? '手機' : '桌機';
  const countryCode = context.request.cf?.country || '';
  const city = context.request.cf?.city || '未知城市';

  const countryMap = {
    'TW':'台灣','CN':'中國','HK':'香港','MO':'澳門',
    'JP':'日本','KR':'韓國','SG':'新加坡','MY':'馬來西亞',
    'TH':'泰國','VN':'越南','PH':'菲律賓','ID':'印尼',
    'US':'美國','CA':'加拿大','GB':'英國','DE':'德國',
    'FR':'法國','IT':'義大利','ES':'西班牙','AU':'澳洲',
  };

  const location = `${countryMap[countryCode] || countryCode || '未知'}／${city}`;

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${context.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: context.env.NOTION_DB_ID },
      properties: {
        '名稱': { title: [{ text: { content: body.result_name } }] },
        '粽子類型': { select: { name: body.result_key } },
        'A票數': { number: body.score_a },
        'B票數': { number: body.score_b },
        'C票數': { number: body.score_c },
        '裝置': { rich_text: [{ text: { content: isMobile } }] },
        '地區': { rich_text: [{ text: { content: location } }] },
      }
    })
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
