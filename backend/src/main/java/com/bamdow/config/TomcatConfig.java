package com.bamdow.config;

import org.springframework.boot.tomcat.servlet.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatConfig {
    //此配置类是为了解决Tomcat对单次上传文件数量的限制
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            // 1. 单次POST请求体最大大小（和你application.yml的max-request-size对应，设100MB）
            connector.setMaxPostSize(100 * 1024 * 1024); // 100MB
            // 2. 单次multipart请求允许的文件+表单字段总数（设500个，足够传100张图+各种字段）
            connector.setMaxPartCount(500);
            // 3. 请求参数总数上限（和maxPartCount匹配）
            connector.setMaxParameterCount(500);
            // 4. 额外：取消POST大小限制的兜底（-1表示无限制，可选）
            // connector.setMaxPostSize(-1);
        });
    }
}