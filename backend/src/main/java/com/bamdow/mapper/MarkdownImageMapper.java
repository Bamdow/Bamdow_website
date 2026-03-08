package com.bamdow.mapper;


import com.bamdow.pojo.entity.MarkdownImage;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MarkdownImageMapper {
    /**
     * 存储md文件中的图片信息
     * @param markdownImage
     */
    void insert(MarkdownImage markdownImage);
}
