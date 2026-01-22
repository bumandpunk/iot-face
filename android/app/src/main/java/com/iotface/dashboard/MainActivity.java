package com.iotface.dashboard;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.content.res.Configuration;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 启用WebView调试
        WebView.setWebContentsDebuggingEnabled(true);
        
        // 配置WebView
        configureWebView();
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        configureWebView();
    }
    
    private void configureWebView() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();
            
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // ===== 核心修复：禁用文字缩放，但保持布局正常 =====
            settings.setTextZoom(100);
            
            // 不设置固定字体大小，让CSS控制
            settings.setDefaultFontSize(16);
            settings.setDefaultFixedFontSize(16);
            settings.setMinimumFontSize(8);
            settings.setMinimumLogicalFontSize(8);
            
            // 禁用用户缩放
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            
            // 使用标准viewport计算
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
            
            // 不强制初始缩放，让WebView自适应
            // webView.setInitialScale(0);
            
            // 启用硬件加速
            webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        }
    }
}
