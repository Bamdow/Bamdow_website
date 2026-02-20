package com.bamdow.utils;

import com.aliyun.oss.ClientException;
import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSException;
import com.aliyun.oss.model.PutObjectRequest;
import com.aliyun.oss.model.PutObjectResult;
import com.bamdow.config.AliyunOssConfiguration;
import jakarta.annotation.Resource;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;

@Data
@Slf4j
@Component
public class AliyunOssUtil {
    @Resource
    private AliyunOssConfiguration aliyunOssConfiguration;

    @Resource
    private OSS ossClient;

    //上传图片到OSS
    public String upload(byte[] bytes, String objectName) {
        try {
            // 创建PutObjectRequest对象。
            PutObjectRequest putObjectRequest = new PutObjectRequest(aliyunOssConfiguration.getBucketName(), objectName, new ByteArrayInputStream(bytes));
            // 创建PutObject请求。
            PutObjectResult result = ossClient.putObject(putObjectRequest);
        } catch (OSSException oe) {
            log.error("OSSException: {}", oe.getErrorMessage());
            throw new RuntimeException("OSS上传失败: " + oe.getErrorMessage());
        } catch (ClientException ce) {
            log.error("ClientException: {}", ce.getMessage());
            throw new RuntimeException("客户端错误: " + ce.getMessage());
        }
        //文件访问路径规则 https://BucketName.Endpoint/ObjectName
        StringBuilder stringBuilder = new StringBuilder("https://");
        stringBuilder
                .append(aliyunOssConfiguration.getBucketName())
                .append(".")
                .append(aliyunOssConfiguration.getEndpoint())
                .append("/")
                .append(objectName);

        log.info("文件上传到:{}", stringBuilder.toString());

        return stringBuilder.toString();
    }
}
