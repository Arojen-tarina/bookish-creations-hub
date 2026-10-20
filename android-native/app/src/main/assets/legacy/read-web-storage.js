// Reads what the old Capacitor (WebView) version of the game kept in
// localStorage. Run by LegacyWebReader in a hidden WebView on the old app's
// origin (https://localhost). Returns one JSON string.
//
// Stats and web achievements were stored in a checksummed envelope
// (src/lib/secureStorage.ts in the original). Values whose checksum does not
// match are dropped, exactly as the old game rejected them.
(function () {
  // Same hash and pepper as the original secureStorage.ts.
  function hash(input) {
    var h1 = 0xdeadbeef ^ input.length;
    var h2 = 0x41c6ce57 ^ input.length;
    for (var i = 0; i < input.length; i++) {
      var ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  }

  function plain(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function parsed(key) {
    var raw = plain(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function secure(key) {
    var envelope = parsed(key);
    if (!envelope || typeof envelope.v !== 'number' || typeof envelope.checksum !== 'string') return null;
    var expected = hash('arojen-tarinat-v1' + envelope.v + JSON.stringify(envelope.data));
    return expected === envelope.checksum ? envelope.data : null;
  }

  return JSON.stringify({
    language: plain('arojen_tarinat_language'),
    audio: parsed('mongol_empire_audio_settings'),
    stats: secure('arojen_tarinat_player_stats_v1'),
    achievements: secure('arojen_tarinat_achievements'),
    consent: plain('arojen_tarinat_analytics_consent_v1'),
    clientId: plain('arojen_tarinat_analytics_client_id_v1'),
    firstOpen: plain('arojen_tarinat_analytics_first_open_v1'),
    days: parsed('arojen_tarinat_analytics_days_v1')
  });
})();
