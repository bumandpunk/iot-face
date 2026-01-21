package com.iotface.dashboard;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 启用WebView调试（帮助排查问题）
        WebView.setWebContentsDebuggingEnabled(true);
        
        // 配置WebView以兼容老版本Android
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.getSettings().setDomStorageEnabled(true);
            webView.getSettings().setDatabaseEnabled(true);
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            
            // 启用混合内容（HTTP和HTTPS混用）
            webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
    }
}
