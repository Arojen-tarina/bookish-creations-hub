package fi.bookish.creations.arojen.tarinat.multiplayer

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ServerTimeTest {
    @Test
    fun `reads Postgres timestamps with an offset and with Z`() {
        val expected = 1_793_461_241_049L
        assertEquals(expected, serverTimeMillis("2026-10-31T15:40:41.049+00:00"))
        assertEquals(expected, serverTimeMillis("2026-10-31T15:40:41.049Z"))
        assertEquals(expected, serverTimeMillis("2026-10-31T17:40:41.049+02:00"))
        // Microseconds, as Postgres writes them.
        assertEquals(expected, serverTimeMillis("2026-10-31T15:40:41.049029+00:00"))
        assertNull(serverTimeMillis("yesterday"))
    }
}
