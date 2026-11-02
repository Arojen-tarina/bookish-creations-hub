package fi.bookish.creations.arojen.tarinat.data

import java.io.File
import java.io.IOException

/**
 * Replaces this file's contents through a temporary file, so a reader sees the
 * old or the new text. If the rename fails, the old file is deleted first and
 * the rename retried, which is not atomic; that is only reached when the
 * target cannot be replaced in place. Throws IOException when the new text is not in place.
 */
internal fun File.writeTextAtomically(text: String) {
    val tmp = File(parentFile, "$name.tmp")
    tmp.writeText(text)
    if (!tmp.renameTo(this)) {
        delete()
        if (!tmp.renameTo(this)) throw IOException("could not move $name into place")
    }
}
