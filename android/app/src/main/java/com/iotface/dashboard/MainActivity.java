package com.iotface.dashboard;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
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
            WebSettings settings = webView.getSettings();
            
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            
            // 启用混合内容（HTTP和HTTPS混用）
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // 禁用文字自动缩放 - 关键修复
            settings.setTextZoom(100);
            
            // 设置默认字体大小
            settings.setDefaultFontSize(16);
            settings.setDefaultFixedFontSize(16);
            settings.setMinimumFontSize(8);
            settings.setMinimumLogicalFontSize(8);
            
            // 启用硬件加速
            webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
            
            // 设置缩放
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            
            // 禁用文本自动调整大小
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
                settings.setTextZoom(100);
            }
        }
    }
}
