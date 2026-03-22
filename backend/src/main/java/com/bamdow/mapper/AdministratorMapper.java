package com.bamdow.mapper;

import com.bamdow.pojo.entity.Administrator;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
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

    /**
     * 根据管理院id查询对应人脸特征信息
     * @param userId
     * @return
     */
   @Select("select feature_str from bamdow_web.administrator where id = #{id}")
    String getFeatureByUserId(int userId);


    /**
     * 存入人脸信息特征
     * @param featureStr
     */
   void updateFeature(String featureStr, int id);
}
