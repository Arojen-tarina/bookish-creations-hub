package fi.bookish.creations.arojen.tarinat.data

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Writes localStorage the way the old Capacitor app did (same origin, same
 * checksummed envelopes) and checks that the import reads it back.
 */
@RunWith(AndroidJUnit4::class)
class LegacyWebReaderTest {
    private val context = InstrumentationRegistry.getInstrumentation().targetContext

    @After
    fun clearStorage() = runBlocking {
        LegacyWebReader.evaluate(context, "localStorage.clear(); 'cleared'")
        Unit
    }

    @Test
    fun readsWhatTheOldAppStored() = runBlocking {
        assertNotNull(LegacyWebReader.evaluate(context, seed(tamperAchievements = false)))
        val data = LegacyWebReader.read(context)!!
        assertEquals("ur", data.language)
        assertEquals(0.5f, data.musicVolume!!, 0.0001f)
        assertEquals(true, data.musicMuted)
        assertEquals(7, data.stats!!.gamesPlayed)
        assertEquals(mapOf("first_steps" to 1_700_000_000_000L), data.unlocks)
        assertEquals(AnalyticsConsent.DENIED, data.analyticsConsent)
        assertEquals("client-1", data.analyticsClientId)
        assertEquals("2026-02-01", data.firstOpenDate)
        assertEquals(setOf("2026-02-01", "2026-02-03"), data.activeDays)
    }

    @Test
    fun dropsValuesWhoseChecksumDoesNotMatch() = runBlocking {
        LegacyWebReader.evaluate(context, seed(tamperAchievements = true))
        val data = LegacyWebReader.read(context)!!
        assertTrue(data.unlocks.isEmpty())
        // The untouched stats envelope still reads.
        assertEquals(7, data.stats!!.gamesPlayed)
    }

    @Test
    fun emptyStorageReadsAsNothing() = runBlocking {
        LegacyWebReader.evaluate(context, "localStorage.clear(); 'cleared'")
        val data = LegacyWebReader.read(context)!!
        assertNull(data.language)
        assertNull(data.stats)
        assertEquals(LegacyWebData(), data)
    }

    /** The old app's writeSecure(), including its hash, and the plain keys it kept. */
    private fun seed(tamperAchievements: Boolean) = """
        (function () {
          function hash(input) {
            var h1 = 0xdeadbeef ^ input.length, h2 = 0x41c6ce57 ^ input.length;
            for (var i = 0; i < input.length; i++) {
              var ch = input.charCodeAt(i);
              h1 = Math.imul(h1 ^ ch, 2654435761);
              h2 = Math.imul(h2 ^ ch, 1597334677);
            }
            h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
            h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
            return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
          }
          function writeSecure(key, data, tamper) {
            var checksum = hash('arojen-tarinat-v1' + 1 + JSON.stringify(data));
            if (tamper) data = Object.assign({}, data, { extra: 1 });
            localStorage.setItem(key, JSON.stringify({ v: 1, data: data, checksum: checksum }));
          }
          localStorage.setItem('arojen_tarinat_language', 'ur');
          localStorage.setItem('mongol_empire_audio_settings', JSON.stringify({ masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8, muted: true }));
          writeSecure('arojen_tarinat_player_stats_v1', {
            gamesPlayed: 7, battlesWon: 3, buildingTypesBuilt: [], uniqueCardIdsPlayed: [], victoriesByFaction: {}
          }, false);
          writeSecure('arojen_tarinat_achievements', { first_steps: 1700000000000 }, $tamperAchievements);
          localStorage.setItem('arojen_tarinat_analytics_consent_v1', 'denied');
          localStorage.setItem('arojen_tarinat_analytics_client_id_v1', 'client-1');
          localStorage.setItem('arojen_tarinat_analytics_first_open_v1', '2026-02-01');
          localStorage.setItem('arojen_tarinat_analytics_days_v1', JSON.stringify(['2026-02-01', '2026-02-03']));
          return 'seeded';
        })();
    """.trimIndent()
}
