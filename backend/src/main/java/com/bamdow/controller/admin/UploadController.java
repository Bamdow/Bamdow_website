package com.bamdow.controller.admin;

import com.bamdow.pojo.result.Result;
import com.bamdow.utils.AliyunOssUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@Slf4j
@RequestMapping("admin/upload")
public class UploadController {

    @Autowired
    private AliyunOssUtil aliyunOssUtil;

    @PostMapping("/images")
    public Result<List<String>> uploadImage(@RequestParam("files") MultipartFile[] files) throws IOException {
        try{
            // 存储所有上传成功的图片URL
            List<String> imageUrlList = new ArrayList<>();

            // 循环处理每个文件
            for (MultipartFile file : files) {
                // 跳过空文件（避免前端误传空文件导致报错）
                if (file.isEmpty()) {
                    log.warn("跳过空文件");
                    continue;
                }

                // 生成唯一文件名（和单文件逻辑一致）
                String fileName = file.getOriginalFilename();
                String suffix = fileName.substring(fileName.lastIndexOf("."));
                String objectName = UUID.randomUUID() + suffix;

                // 调用工具类上传，获取单个文件URL
                String imageUrl = aliyunOssUtil.upload(file.getBytes(), objectName);

                // 收集URL
                imageUrlList.add(imageUrl);
            }
            // 返回所有URL列表
            log.info("多图片上传成功，共上传{}张", imageUrlList.size());
            return Result.success(imageUrlList);
    }catch (Exception e){
        log.error("图片上传失败",e);
        return Result.error(e.getMessage());}
    }
}