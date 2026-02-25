package com.bamdow.mapper;

import com.bamdow.pojo.entity.OtherProject;
import com.bamdow.pojo.entity.PhotographyProject;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OtherProjectMapper {
    /**
     * 插入其他项目表
     * @param otherProject 其他项目实体
     */
    void insert(OtherProject otherProject);

    /**
     * 根据id查询其他项目表
     * @param id
     */
    @Select("select * from other_projects where id = #{id}")
    OtherProject getById(String id);


    /**
     * 更新其他项目
     * @param otherProject
     */
    void update(OtherProject otherProject);
}