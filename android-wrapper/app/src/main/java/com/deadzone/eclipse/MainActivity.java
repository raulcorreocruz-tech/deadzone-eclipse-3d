package com.deadzone.eclipse;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class MainActivity extends Activity {
    private static final String GAME_HOST = "deadzone-eclipse-coop-recovery.onrender.com";
    private static final String GAME_URL = "https://" + GAME_HOST + "/?android=1";
    private WebView game;

    private void fullScreen() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        fullScreen();

        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 25, 33));
        game.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        game.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        game.setWebChromeClient(new WebChromeClient());
        game.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Keep the already-installed APK's web game and What's New up to date.
                view.evaluateJavascript(
                    "if(navigator.serviceWorker){navigator.serviceWorker.getRegistrations()"
                    + ".then(rs=>rs.forEach(r=>r.update().catch(()=>{})))"
                    + ".catch(()=>{})};window.dz525CheckForUpdates?.()",
                    null
                );
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri = request.getUrl();
                if ("https".equalsIgnoreCase(uri.getScheme())
                    && GAME_HOST.equalsIgnoreCase(uri.getHost())) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (!request.isForMainFrame()) return;
                String offline = "<!doctype html><html lang='es'><head>"
                    + "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                    + "<style>body{background:#101921;color:white;font:18px system-ui;text-align:center;"
                    + "display:grid;place-content:center;height:90vh;padding:18px}"
                    + "button{background:#f39d63;border:0;padding:14px 22px;border-radius:8px;"
                    + "font:bold 17px system-ui}</style></head><body>"
                    + "<h2>SIN CONEXIÓN CON DEAD ZONE</h2>"
                    + "<p>Esta APK de prueba necesita Internet para cargar el juego y el cooperativo.</p>"
                    + "<button onclick='location.href=\"" + GAME_URL + "\"'>REINTENTAR</button>"
                    + "</body></html>";
                view.loadDataWithBaseURL(GAME_URL, offline, "text/html", "UTF-8", null);
            }
        });
        setContentView(game);
        if (savedInstanceState == null || game.restoreState(savedInstanceState) == null) {
            game.loadUrl(GAME_URL + "&launch=" + System.currentTimeMillis());
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (game != null) {
            // Existing browser game maps Escape to pause/resume and close menus.
            game.evaluateJavascript(
                "window.dispatchEvent(new KeyboardEvent('keydown',"
                    + "{key:'Escape',code:'Escape',bubbles:true}))",
                null
            );
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        fullScreen();
        if (game != null) {
            game.onResume();
            game.evaluateJavascript("window.dz525CheckForUpdates?.()", null);
        }
    }

    @Override
    protected void onPause() {
        if (game != null) game.onPause();
        super.onPause();
    }

    @Override
    protected void onSaveInstanceState(Bundle state) {
        if (game != null) game.saveState(state);
        super.onSaveInstanceState(state);
    }

    @Override
    protected void onDestroy() {
        if (game != null) {
            game.destroy();
            game = null;
        }
        super.onDestroy();
    }
}
