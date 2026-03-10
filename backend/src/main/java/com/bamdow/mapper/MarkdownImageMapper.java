package com.bamdow.mapper;


import com.bamdow.pojo.entity.MarkdownImage;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MarkdownImageMapper {
    /**
     * 存储md文件中的图片信息
     * @param markdownImage
     */
    void insert(MarkdownImage markdownImage);

    /**
     * 根据id删除md中的图片
     * @param markdownId
     */
    @Delete("delete from bamdow_web.markdown_images where markdown_id =#{markdownId}")
    void deleteById(String markdownId);
}
