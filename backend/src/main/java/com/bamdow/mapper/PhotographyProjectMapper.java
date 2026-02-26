package com.bamdow.mapper;

import com.bamdow.pojo.entity.PhotographyProject;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface PhotographyProjectMapper {
    /**
     * 插入摄影项目表
     * @param photographyProject 摄影项目实体
     */
    void insert(PhotographyProject photographyProject);

    /**
     * 根据id查询摄影项目表
     * @param id
     */
    @Select("select * from photography_projects where id = #{id}")
    PhotographyProject getById(String id);

    /**
     * 更新摄影项目
     * @param photographyProject
     */
    void update(PhotographyProject photographyProject);

    /**
     * 根据id删除项目
     * @param id
     */
    @Delete("delete from photography_projects where id=#{id}")
    void deleteById(String id);
}