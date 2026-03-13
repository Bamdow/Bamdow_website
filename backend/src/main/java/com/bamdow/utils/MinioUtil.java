package com.bamdow.utils;

import com.bamdow.config.MinioConfig;
import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class MinioUtil {
    @Autowired
    private MinioConfig minioConfig;
    @Autowired
    private MinioClient minioClient;
    /**
     * 上传文件到MinIO
     * @param file 要上传的文件（Spring MultipartFile）
     * @return 文件在MinIO中的唯一标识（对象名称）
     */
    public String uploadFile(MultipartFile file,String objectName) throws Exception {
        // 1. 检查存储桶是否存在，不存在则创建
        if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build())) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(minioConfig.getBucket()).build());
        }

//        // 2. 生成唯一文件名（避免重名）
//        String originalFilename = file.getOriginalFilename();
//        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
//        String objectName = UUID.randomUUID().toString() + fileExtension;

        // 3. 上传文件
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(minioConfig.getBucket())          // 存储桶名称
                        .object(objectName)          // 对象名称（文件名）
                        .stream(file.getInputStream(), file.getSize(), -1)  // 文件流和大小
                        .contentType(file.getContentType())  // 文件类型
                        .build());
        log.info("文件上传到:{}", getFileUrl(objectName));
        return getFileUrl(objectName);
        //返回结果：test/随机字符串.txt
    }

    /**
     * 获取文件临时访问URL（适合前端直接下载）
     * @param objectName 文件在MinIO中的唯一标识
     * @return 可访问的URL
     */
    public String getFileUrl(String objectName) throws Exception {
        //objectName = "随机字符串.txt"
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(minioConfig.getBucket())
                        .object(objectName)
                        .build());
        //返回结果：http://localhost:9000/bucket/随机字符串.txt?......
    }

    /**
     * 删除文件
     * @param objectName 文件在MinIO中的唯一标识
     */
    public void deleteFile(String objectName) throws Exception {
        //objectName = "随机字符串.txt"
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(minioConfig.getBucket())
                        .object(objectName)
                        .build());
    }
}
