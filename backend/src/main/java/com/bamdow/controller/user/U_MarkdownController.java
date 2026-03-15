package com.bamdow.controller.user;


import cn.dev33.satoken.annotation.SaCheckLogin;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.result.Result;
import com.bamdow.service.MarkdownService;
import com.bamdow.utils.MarkdownProcessor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("user/markdown")
public class U_MarkdownController {

    @Autowired
    private MarkdownProcessor markdownProcessor;

    @Autowired
    private MarkdownService markdownService;


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

}