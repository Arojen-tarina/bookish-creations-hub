package fi.bookish.creations.arojen.tarinat;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import fi.bookish.creations.arojen.tarinat.achievements.AchievementPlugin;

/**
 * Android entry point for the game app.
 *
 * The class intentionally stays minimal because Capacitor manages the app lifecycle,
 * plugin setup, and WebView configuration via BridgeActivity.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugins must be registered before BridgeActivity#onCreate builds the bridge.
        registerPlugin(AchievementPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
