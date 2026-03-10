package com.bamdow.controller.admin;


import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.result.Result;
import com.bamdow.service.MarkdownService;
import com.bamdow.utils.MarkdownProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("admin/markdown")
public class MarkdownController {


    @Autowired
    private MarkdownProcessor markdownProcessor;

    @Autowired
    private MarkdownService markdownService;

    @PostMapping
    public Result<String> uploadMarkdown(
            @RequestParam("file") MultipartFile markdownFile,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles) {
        try {
            // 3. 处理图片文件为空的情况：如果imageFiles为null，传入空数组而非null
            MultipartFile[] finalImageFiles = (imageFiles == null) ? new MultipartFile[0] : imageFiles;
            // 调用MarkdownProcessor处理文件，传入图片文件数组
            String markdownUrl = markdownProcessor.processMarkdown(markdownFile, finalImageFiles);
            log.info("Markdown url:{}",markdownUrl);
            return Result.success(markdownUrl);
        } catch (Exception e) {
            log.error("Markdown文件处理失败", e);
            return Result.error("Markdown文件处理失败: " + e.getMessage());
        }
    }

    @GetMapping
    public Result<PageResult> page(PageQuery pageQuery) {
        log.info("md文件分页查询{}",pageQuery);
        PageResult pageResult=markdownService.pageQuery(pageQuery);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    public Result<String> detail(@PathVariable String id) {
        log.info("查询md文件id为:{}",id);
        String ossUrl=markdownService.getById(id);
        return Result.success(ossUrl);
    }

    @DeleteMapping
    public Result delete(@RequestParam List<String> ids) {
        log.info("作品批量删除{}",ids);
        markdownService.deleteBatch(ids);
        return Result.success();
    }
}