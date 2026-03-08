package com.bamdow.utils;
import com.bamdow.controller.admin.UploadController;
import com.bamdow.mapper.MarkdownImageMapper;
import com.bamdow.pojo.dto.MarkdownFileCreateDTO;
import com.bamdow.pojo.dto.MarkdownImageCreateDTO;
import com.bamdow.service.MarkdownService;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Data
@Slf4j
@Component
public class MarkdownProcessor {

    @Autowired
    private AliyunOssUtil aliyunOssUtil;

    @Autowired
    UploadController uploadController;

    @Autowired
    private MarkdownImageMapper markdownImageMapper;

    @Autowired
    private MarkdownService markdownService;

    /**
     * 处理md文件，返回处理后的文件URL
     * @param markdownFile
     * @return
     * @throws IOException
     */
    public String processMarkdown(MultipartFile markdownFile,MultipartFile[] imageFiles) throws IOException {
        //读取md文件内容
        String content = new String(markdownFile.getBytes(), "UTF-8");
        //提取图片并处理
        Map<String,String> imagesMap=new HashMap<>();
        imagesMap=extractAndUploadImages(content,imageFiles);


        //替换图片上传路径
        String modifiedContent=replaceImagePaths(content,imagesMap);
        //md保存到数据库
        MarkdownFileCreateDTO markdownFileCreateDTO = uploadMarkdown(modifiedContent, markdownFile.getOriginalFilename());
        markdownFileCreateDTO.setFileName(markdownFile.getOriginalFilename());
        String mdFileId=markdownService.saveMd(markdownFileCreateDTO);
        //md中文件图片信息保存到数据库
        MarkdownImageCreateDTO markdownImageCreateDTO=new MarkdownImageCreateDTO();
        markdownImageCreateDTO.setMarkdownId(mdFileId);
        markdownService.saveMdImage(markdownImageCreateDTO,imagesMap);
        //上传修改后的Markdown文件
        return markdownFileCreateDTO.getOssUrl();
    }

    /**
     * 提取md中的图片
     * @param markdownContent
     * @return
     */
    public Map<String,String> extractAndUploadImages(String markdownContent,MultipartFile[] imageFiles) {

        Map<String,String> imagesPathMap=new HashMap<>();

        // 使用正则表达式匹配Markdown图片标签 ![alt](path)
        Pattern pattern = Pattern.compile("!\\[([^\\]]*)\\]\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(markdownContent);

        while (matcher.find()) {
            try {
                String imagePath = matcher.group(2);
                // 处理图片（Base64或本地路径）
                String ossUrl = uploadImageToOss(imagePath,imageFiles);
                MarkdownImageCreateDTO markdownImageCreateDTO=new MarkdownImageCreateDTO();
                markdownImageCreateDTO.setOssUrl(ossUrl);
                //使用源路径名和oss存放路径形成键值对
                imagesPathMap.put(imagePath, ossUrl);
            } catch (Exception e) {
                log.warn("无本地图片或处理图片失败: " + e);
            }
        }
        return imagesPathMap;
    }

    /**
     * 上传md文件中的图片到oss
     *
     * @param imagePath
     * @param imageFiles
     * @return
     */
    private String uploadImageToOss(String imagePath, MultipartFile[] imageFiles) {
        // 检查是否为Base64编码图片
        if (imagePath.startsWith("data:image/")) {
            // 处理Base64编码图片
            return handleBase64Image(imagePath);
        } else {
            // 处理本地路径图片
            String ossUrl = handleLocalImage(imagePath, imageFiles);
            return ossUrl;
        }
    }

    /**
     * 上传本地图片文件
     * @param localPath
     * @param imageFiles
     * @return
     */
    private String handleLocalImage(String localPath, MultipartFile[] imageFiles) {
        // 从本地路径中提取文件名
        String fileName = localPath.substring(localPath.lastIndexOf("/") + 1);

        // 查找对应的上传文件
        MultipartFile matchedFile = findMatchedImageFile(fileName, imageFiles);

        if (matchedFile == null) {
            throw new RuntimeException("未找到对应的图片文件: " + fileName);
        }

        try {
            // 生成唯一文件名
            String suffix = fileName.substring(fileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + suffix;
            String objectName = "images/" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "/" + uniqueFileName;

            // 上传到OSS
            byte[] bytes = matchedFile.getBytes();
            return aliyunOssUtil.upload(bytes, objectName);
        } catch (IOException e) {
            throw new RuntimeException("图片文件处理失败: " + e.getMessage());
        }
    }

    private MultipartFile findMatchedImageFile(String fileName, MultipartFile[] imageFiles) {
        if (imageFiles == null || imageFiles.length == 0) {
            return null;
        }

        // 提取纯文件名（去除路径）
        String pureFileName = fileName;
        if (fileName.contains("\\")) {
            pureFileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        } else if (fileName.contains("/")) {
            pureFileName = fileName.substring(fileName.lastIndexOf("/") + 1);
        }

        // 遍历所有上传的图片文件，查找文件名匹配的文件
        for (MultipartFile file : imageFiles) {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null) {
                // 精确匹配
                if (originalFilename.equals(fileName)) {
                    return file;
                }
                // 匹配纯文件名
                if (originalFilename.equals(pureFileName)) {
                    return file;
                }
                // 后缀匹配（处理可能的路径差异）
                if (originalFilename.endsWith(fileName)) {
                    return file;
                }
                if (originalFilename.endsWith(pureFileName)) {
                    return file;
                }
            }
        }

        return null;
    }

    /**
     * Base64编码图片处理
     * @param base64Image
     * @return
     */
    private String handleBase64Image(String base64Image) {
        String base64Data=base64Image;
        // 解码Base64数据
        byte[] imageBytes = Base64.getDecoder().decode(base64Data);

        //生成唯一文件名
        String suffix = getImageSuffixFromBase64(base64Image);
        String fileName=UUID.randomUUID().toString()+suffix;
        String objectName = "images/" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "/" + fileName;

        //上传到oss
        return aliyunOssUtil.upload(imageBytes, objectName);

    }

    /**
     * 获取到Base64文件的后缀
     * @param base64Image
     * @return
     */
    private String getImageSuffixFromBase64(String base64Image) {
        //从base64头部提取图片类型
        String type = base64Image.split(":")[1].split(";" )[0].split("/")[1];
        return "." + type;
    }

    /**
     * 替换图片路径
     * @param markdownContent
     * @param markdownContent,imagesPaths
     * @return
     */
    public String replaceImagePaths(String markdownContent,Map<String,String> imagesPathMap) {
        String result = markdownContent;
        for (Map.Entry<String, String> entry : imagesPathMap.entrySet()) {
            String originalPath = entry.getKey();
            String ossUrl = entry.getValue();
            // 使用正则表达式替换图片路径
            // 构建正则表达式，匹配 ![alt](originalPath) 格式
            String regex = "(!\\[([^\\]]*)\\]\\()" + Pattern.quote(originalPath) + "(\\))";
            Pattern pattern = Pattern.compile(regex);
            Matcher matcher = pattern.matcher(result);

            // 替换所有匹配的图片路径
            result = matcher.replaceAll("$1" + ossUrl + "$3");
        }
        return result;
    }

    /**
     * 上传修改后的Markdown文件
     *
     * @param content
     * @param objectFileName
     * @return
     */
    public MarkdownFileCreateDTO uploadMarkdown(String content, String objectFileName) {
        // 生成唯一文件名，格式：markdown/yyyyMMdd/UUID.md
        String datePath = new SimpleDateFormat("yyyyMMdd").format(new Date());
        String fileName = UUID.randomUUID().toString() + ".md";
        String objectName = "markdown/" + datePath + "/" + fileName;

        // 使用AliyunOssUtil上传文件
        byte[] bytes = content.getBytes();
        MarkdownFileCreateDTO markdownFileCreateDTO = new MarkdownFileCreateDTO();
        markdownFileCreateDTO.setFileName(objectName);
        markdownFileCreateDTO.setOssUrl(aliyunOssUtil.upload(bytes, objectName));
        return markdownFileCreateDTO;
    }
}
