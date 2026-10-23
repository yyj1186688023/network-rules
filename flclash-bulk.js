// Static adapter for a MESL URL profile. Rules are updated separately by Mihomo.
// No network calls, logging, credentials, DNS, TUN, or existing selection changes.
const main = (config) => {
  const provider = 'user-bulk';
  const group = '大文件下载';
  const url = 'https://raw.githubusercontent.com/yyj1186688023/network-rules/main/shared-rules.yaml';
  if (!config || !Array.isArray(config.proxies) || !Array.isArray(config['proxy-groups']) || !Array.isArray(config.rules)) {
    throw new Error('Expected the original MESL proxy, group, and rule lists');
  }
  const names = new Set(config.proxies.map(p => p.name).concat(config['proxy-groups'].map(p => p.name)));
  const candidates = ['🇯🇵 日本 01 [0.3X]', '🇯🇵 日本 02', 'MESL'];
  if (!candidates.every(name => names.has(name))) {
    throw new Error('MESL node names changed; adapter needs review');
  }
  config['rule-providers'] = config['rule-providers'] || {};
  const old = config['rule-providers'][provider];
  if (old && old.url !== url) throw new Error('Provider name already used');
  const existing = config['proxy-groups'].find(p => p.name === group);
  if (existing && (existing.type !== 'select' || JSON.stringify(existing.proxies) !== JSON.stringify(candidates))) {
    throw new Error('Group name already used');
  }
  config['rule-providers'][provider] = {
    type: 'http', behavior: 'classical', format: 'yaml',
    path: './rule-providers/user-bulk.yaml', url, interval: 86400, proxy: 'MESL'
  };
  if (!existing) config['proxy-groups'].push({name: group, type: 'select', proxies: candidates});
  const rule = 'RULE-SET,' + provider + ',' + group;
  config.rules = [rule].concat(config.rules.filter(r => r !== rule));
  const mediaProvider = 'user-media';
  const mediaGroup = '低倍率媒体';
  const mediaUrl = 'https://raw.githubusercontent.com/yyj1186688023/network-rules/main/media-rules.yaml';
  const mediaCandidates = ['🇯🇵 日本 01 [0.3X]', 'MESL'];
  const oldMedia = config['rule-providers'][mediaProvider];
  if (oldMedia && oldMedia.url !== mediaUrl) throw new Error('Media provider name already used');
  const existingMedia = config['proxy-groups'].find(p => p.name === mediaGroup);
  if (existingMedia && (existingMedia.type !== 'select' || JSON.stringify(existingMedia.proxies) !== JSON.stringify(mediaCandidates))) {
    throw new Error('Media group name already used');
  }
  config['rule-providers'][mediaProvider] = {
    type: 'http', behavior: 'classical', format: 'yaml',
    path: './rule-providers/user-media.yaml', url: mediaUrl, interval: 86400, proxy: 'MESL'
  };
  if (!existingMedia) config['proxy-groups'].push({name: mediaGroup, type: 'select', proxies: mediaCandidates});
  const mediaRule = 'RULE-SET,' + mediaProvider + ',' + mediaGroup;
  config.rules = [mediaRule].concat(config.rules.filter(r => r !== mediaRule));
  return config;
};
