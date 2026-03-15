package com.bamdow.mapper;

import com.bamdow.pojo.entity.Administrator;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdministratorMapper {

    /**
     * 根据管理员名查找对应对象
     * @param administratorname
     * @return
     */
    @Select("select * from bamdow_web.administrator where administratorname = #{administratorname}")
    Administrator getByAdname(String administratorname);
}
