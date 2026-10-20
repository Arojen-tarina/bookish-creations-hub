package fi.bookish.creations.arojen.tarinat.data

import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** The parsing and merging half of the WebView import (the WebView half runs on a device, see androidTest). */
class LegacyWebImportTest {

    @Test
    fun `everything the old version stored is read`() {
        val data = LegacyWebData.parse(
            """
            {"language":"fi",
             "audio":{"masterVolume":0.7,"musicVolume":0.5,"sfxVolume":0.8,"muted":true},
             "stats":{"gamesPlayed":12,"gamesWon":3,"battlesWon":40,"buildingTypesBuilt":["farm","market"],
                      "uniqueCardIdsPlayed":["c1"],"victoriesByFaction":{"mongol":2,"song":1},
                      "lastPlayedDate":"2026-09-01","fastestVictoryTurn":null,"fieldFromLater":7},
             "achievements":{"first_steps":1700000000000,"broken":"x"},
             "consent":"granted","clientId":"abc-123","firstOpen":"2026-01-05",
             "days":["2026-01-05","2026-01-06"]}
            """,
        )
        assertEquals("fi", data.language)
        // The old defaults (master 0.7, music 0.5) map to this app's default volume.
        assertEquals(0.5f, data.musicVolume!!, 0.0001f)
        assertEquals(true, data.musicMuted)
        val stats = data.stats!!
        assertEquals(12, stats.gamesPlayed)
        assertEquals(40, stats.battlesWon)
        assertEquals(setOf("farm", "market"), stats.buildingTypesBuilt)
        assertEquals(mapOf(FactionId.MONGOL to 2, FactionId.SONG to 1), stats.victoriesByFaction)
        assertEquals("2026-09-01", stats.lastPlayedDate)
        assertEquals(mapOf("first_steps" to 1_700_000_000_000L), data.unlocks)
        assertEquals(AnalyticsConsent.GRANTED, data.analyticsConsent)
        assertEquals("abc-123", data.analyticsClientId)
        assertEquals("2026-01-05", data.firstOpenDate)
        assertEquals(setOf("2026-01-05", "2026-01-06"), data.activeDays)
    }

    @Test
    fun `missing, damaged or rejected values are left out`() {
        val empty = LegacyWebData()
        assertEquals(empty, LegacyWebData.parse("not json"))
        assertEquals(
            empty,
            LegacyWebData.parse(
                """{"language":null,"audio":null,"stats":null,"achievements":null,"consent":null,"clientId":"","firstOpen":null,"days":null}""",
            ),
        )
        // A volume the player turned up stays louder than the default; stats of the wrong shape are skipped.
        val loud = LegacyWebData.parse("""{"audio":{"masterVolume":1,"musicVolume":0.9,"muted":false},"stats":{"gamesPlayed":"lots"},"consent":"maybe"}""")
        assertEquals(1f, loud.musicVolume!!, 0.0001f)
        assertEquals(false, loud.musicMuted)
        assertNull(loud.stats)
        assertNull(loud.analyticsConsent)
    }

    @Test
    fun `unlocks merge keeping the earlier time and only real achievements`() {
        val merged = mergeUnlocks(
            current = mapOf("a" to 100L),
            imported = mapOf("a" to 50L, "b" to 200L, "unknown" to 10L, "future" to 5_000L, "zero" to 0L),
            known = setOf("a", "b", "future", "zero"),
            now = 1_000L,
        )
        assertEquals(mapOf("a" to 50L, "b" to 200L), merged)
        assertTrue(mergeUnlocks(emptyMap(), emptyMap(), setOf("a"), 1L).isEmpty())
    }
}
