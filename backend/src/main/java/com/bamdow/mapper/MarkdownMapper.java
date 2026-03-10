package com.bamdow.mapper;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.entity.MarkdownFile;
import com.github.pagehelper.Page;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface MarkdownMapper {

    /**
     * 新增md文件
     * @param markdownFile
     */
    void insert(MarkdownFile markdownFile);

    /**
     * md文件分页查询
     * @param pageQuery
     * @return
     */
    Page<MarkdownFile> pageQuery(PageQuery pageQuery);

    /**
     * 根据id查询md文件
     * @param id
     * @return
     */
    @Select("select * from bamdow_web.markdown_files where id = #{id}")
    MarkdownFile getById(String id);

    /**
     * 根据id删除md文件
     * @param id
     */
    @Delete("delete from bamdow_web.markdown_files where id = #{id}")
    void deleteById(String id);
}
