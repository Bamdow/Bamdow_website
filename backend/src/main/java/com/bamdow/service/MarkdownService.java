package com.bamdow.service;

import com.bamdow.pojo.dto.MarkdownFileCreateDTO;
import com.bamdow.pojo.dto.MarkdownImageCreateDTO;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.result.PageResult;

import java.util.List;
import java.util.Map;

public interface MarkdownService {
    //新增md文件
    String saveMd(MarkdownFileCreateDTO markdownFileCreateDTO);
    //md文件分页查询
    PageResult pageQuery(PageQuery pageQuery);

    //添加md文件中的图片
    void saveMdImage(MarkdownImageCreateDTO markdownImageCreateDTO, Map<String,String> imagesMap);

    //获取到md文件
    String getById(String id);

    //批量删除md文件
    void deleteBatch(List<String> ids);
}
