# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add these lines if they are missing in your proguard-rules.pro
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**

-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

-keep class com.shopify.** { *; }
-dontwarn com.shopify.**

# Add any project specific keep options here:
