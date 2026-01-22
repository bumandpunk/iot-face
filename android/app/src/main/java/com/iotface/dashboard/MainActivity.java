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
        
        // 启用WebView调试（帮助排查问题）
        WebView.setWebContentsDebuggingEnabled(true);
        
        // 配置WebView以兼容老版本Android
        configureWebView();
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // 配置改变时重新设置WebView，防止字体缩放
        configureWebView();
    }
    
    private void configureWebView() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();
            
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            
            // 启用混合内容（HTTP和HTTPS混用）
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            
            // ===== 关键修复：强制禁用文字自动缩放 =====
            settings.setTextZoom(100);
            
            // 设置固定字体大小（不受系统字体影响）
            settings.setDefaultFontSize(16);
            settings.setDefaultFixedFontSize(16);
            settings.setMinimumFontSize(16);  // 提高最小字体，防止缩放
            settings.setMinimumLogicalFontSize(16);
            
            // 禁用所有缩放功能
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            
            // 使用固定宽度viewport
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(false);  // 改为false，避免自动缩放
            settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
            
            // 强制设置初始缩放比例
            webView.setInitialScale(100);
            
            // 启用硬件加速
            webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
            
            // 禁用系统字体缩放影响
            webView.getSettings().setTextZoom(100);
        }
    }
}
