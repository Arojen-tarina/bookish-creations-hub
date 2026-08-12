# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Keep line numbers for readable crash stack traces.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Capacitor's plugin bridge finds plugin methods via annotations at runtime.
# Without keeping annotations, R8 strips them and the WebView<->native bridge
# breaks (this is what caused release builds to crash after minifyEnabled=true).
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Capacitor core + plugins (annotated methods and plugin classes)
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.Permission <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}
-keep public class * extends com.getcapacitor.Plugin { *; }

# Legacy Cordova plugin compatibility
-keep public class * extends org.apache.cordova.* {
  public <methods>;
  public <fields>;
}

# WebView JavaScript interface methods must survive obfuscation
-keepclassmembers class * {
   @android.webkit.JavascriptInterface <methods>;
}

# Google Mobile Ads / AdMob (capacitor-community/admob)
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.gms.internal.ads.** { *; }
-keep class com.google.android.ump.** { *; }
-keep class com.getcapacitor.community.admob.** { *; }
-dontwarn com.google.android.gms.ads.**

-keepclassmembers class * implements android.os.Parcelable {
  public static final ** CREATOR;
}
-keepclassmembers enum * {
  public static **[] values();
  public static ** valueOf(java.lang.String);
}
