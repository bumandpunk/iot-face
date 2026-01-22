package com.iotface.dashboard;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.util.DisplayMetrics;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // ===== 关键修复：强制覆盖系统字体缩放 =====
        adjustFontScale(getResources().getConfiguration(), 1.0f);
        
        super.onCreate(savedInstanceState);
        
        // 启用WebView调试（帮助排查问题）
        WebView.setWebContentsDebuggingEnabled(true);
        
        // 配置WebView以兼容老版本Android
        configureWebView();
    }
    
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // ===== 强制覆盖系统字体缩放 =====
        adjustFontScale(newConfig, 1.0f);
        // 配置改变时重新设置WebView，防止字体缩放
        configureWebView();
    }
    
    /**
     * 强制覆盖系统字体缩放设置
     */
    private void adjustFontScale(Configuration configuration, float scale) {
        if (configuration != null) {
            configuration.fontScale = scale;
            DisplayMetrics metrics = getResources().getDisplayMetrics();
            metrics.scaledDensity = metrics.density * scale;
            getResources().updateConfiguration(configuration, metrics);
        }
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
            
            // ===== 核心修复：多重防护禁用文字缩放 =====
            settings.setTextZoom(100);
            
            // 设置固定字体大小
            settings.setDefaultFontSize(16);
            settings.setDefaultFixedFontSize(16);
            settings.setMinimumFontSize(1);
            settings.setMinimumLogicalFontSize(1);
            
            // 禁用所有缩放功能
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            
            // ===== 关键：使用固定宽度viewport =====
            settings.setUseWideViewPort(true);
            settings.setLoadWithOverviewMode(true);
            settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
            
            // ===== 强制设置初始缩放 =====
            webView.setInitialScale(0);  // 改为0让系统自动适配，但结合其他设置
            
            // 启用硬件加速
            webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        }
    }
}
