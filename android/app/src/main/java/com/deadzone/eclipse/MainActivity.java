package com.deadzone.eclipse;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceError;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.net.Uri;
import org.json.JSONObject;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.ByteArrayOutputStream;

public final class MainActivity extends Activity {
    private static final String GAME = "https://deadzone-eclipse-coop.onrender.com/";
    private static final String LOCAL = "https://appassets.androidplatform.net/index.html";
    private boolean localFallback = false;
    private static final String VERSION = "https://raw.githubusercontent.com/raulcorreocruz-tech/deadzone-eclipse-3d/main/android-version.json";
    private FrameLayout root;
    private WebView web;
    private TextView status;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        immerse();
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(7, 10, 15));
        setContentView(root);
        status = new TextView(this);
        status.setText("DEAD ZONE: ECLIPSE\n\nConectando con el servidor…");
        status.setTextColor(Color.WHITE);
        status.setTextSize(18);
        status.setGravity(Gravity.CENTER);
        root.addView(status, new FrameLayout.LayoutParams(-1, -1));
        createGameView();
        checkForNativeUpdate();
    }

    private void immerse() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    private void createGameView() {
        web = new WebView(this);
        web.setBackgroundColor(Color.rgb(7, 10, 15));
        web.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public android.webkit.WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("appassets.androidplatform.net".equalsIgnoreCase(uri.getHost()) && ("/index.html".equals(uri.getPath()) || "/".equals(uri.getPath()))) {
                    try { return new android.webkit.WebResourceResponse("text/html", "UTF-8", getAssets().open("index.html")); }
                    catch (Exception ignored) { return null; }
                }
                return super.shouldInterceptRequest(view, request);
            }
            private void switchToLocal() {
                if (localFallback) return;
                localFallback = true;
                runOnUiThread(() -> {
                    status.setVisibility(View.VISIBLE);
                    status.setText("Sin conexión al servidor cooperativo. Abriendo modo individual incluido...");
                    web.loadUrl(LOCAL);
                });
            }
            @Override public void onReceivedHttpError(WebView view, WebResourceRequest req, android.webkit.WebResourceResponse response) {
                if (req.isForMainFrame() && response.getStatusCode() >= 400) switchToLocal();
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("deadzone-eclipse-coop.onrender.com".equalsIgnoreCase(u.getHost()) || "appassets.androidplatform.net".equalsIgnoreCase(u.getHost())) return false;
                Intent open = new Intent(Intent.ACTION_VIEW, u);
                try { startActivity(open); } catch(Exception ignored) {}
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (status != null) status.setVisibility(View.GONE);
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError error) {
                if (!req.isForMainFrame()) return;
                if (!localFallback) switchToLocal();
                else {
                    status.setVisibility(View.VISIBLE);
                    status.setText("No se ha podido iniciar. Comprueba tu conexión a Internet y toca aquí.");
                    status.setOnClickListener(v -> loadGame());
                }
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        status.bringToFront();
        loadGame();
    }

    private void loadGame() {
        status.setVisibility(View.VISIBLE);
        status.setText("DEAD ZONE: ECLIPSE\n\nCargando juego online…");
        // The live multiplayer server gets updates without needing a new native APK; the embedded fallback is offline only.
        localFallback = false;
        web.loadUrl(GAME + "?android=1&fresh=" + System.currentTimeMillis());
    }

    private void checkForNativeUpdate() {
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(VERSION).openConnection();
                c.setConnectTimeout(6000);
                c.setReadTimeout(6000);
                c.setUseCaches(false);
                if (c.getResponseCode() != 200) { c.disconnect(); return; }
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024]; int n;
                try (java.io.InputStream stream = c.getInputStream()) {
                    while((n = stream.read(buffer)) != -1 && output.size() < 32768) output.write(buffer, 0, n);
                }
                c.disconnect();
                JSONObject v = new JSONObject(output.toString("UTF-8"));
                final int latest = v.optInt("versionCode", 1);
                final String apk = v.optString("apkUrl", "");
                final String note = v.optString("message", "Nueva versión de Android disponible.");
                int installed = getPackageManager().getPackageInfo(getPackageName(), 0).versionCode;
                if (latest > installed && apk.startsWith("https://")) {
                    runOnUiThread(() -> new AlertDialog.Builder(this)
                        .setTitle("Actualización disponible")
                        .setMessage(note + "\n\nAndroid solicitará tu autorización para instalar la nueva APK.")
                        .setPositiveButton("Descargar actualización", (d, w) -> {
                            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(apk))); } catch(Exception ignored) {}
                        })
                        .setNegativeButton("Más tarde", null).show());
                }
            } catch (Exception ignored) {
                // Offline mode: the game loads or shows its own reconnect interface.
            }
        }).start();
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) immerse();
    }
    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else new AlertDialog.Builder(this).setTitle("Salir del juego")
          .setMessage("¿Quieres cerrar DEAD ZONE?")
          .setNegativeButton("Seguir jugando", null)
          .setPositiveButton("Salir", (d,w) -> finish()).show();
    }
    @Override protected void onDestroy() {
        if (web != null) { web.destroy(); web = null; }
        super.onDestroy();
    }
}
