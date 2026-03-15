package com.bamdow.service.impl;


import com.bamdow.mapper.MarkdownImageMapper;
import com.bamdow.mapper.MarkdownMapper;
import com.bamdow.mapper.ProjectMapper;
import com.bamdow.pojo.dto.MarkdownFileCreateDTO;
import com.bamdow.pojo.dto.MarkdownImageCreateDTO;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.entity.MarkdownFile;
import com.bamdow.pojo.entity.MarkdownImage;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.vo.MarkdownFileVO;
import com.bamdow.service.MarkdownService;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MarkdownServiceImpl implements MarkdownService {

    @Autowired
    private MarkdownMapper markdownMapper;

    @Autowired
    private MarkdownImageMapper markdownImageMapper;
    @Autowired
    private ProjectMapper projectMapper;

    /**
     *
     * 存储md文件信息到数据库，并暴露mdfile的id给saveImage方法
     * @param markdownFileCreateDTO
     * @return
     */
    @Override
    public String saveMd(MarkdownFileCreateDTO markdownFileCreateDTO) {
        MarkdownFile markdownFile=new MarkdownFile();
        markdownFile.setId(UUID.randomUUID().toString());
        markdownFile.setFileName(markdownFileCreateDTO.getFileName());
        markdownFile.setOssUrl(markdownFileCreateDTO.getOssUrl());
        markdownMapper.insert(markdownFile);
        return markdownFile.getId();
    }

    @Override
    public PageResult pageQuery(PageQuery pageQuery) {
        PageHelper.startPage(pageQuery.getPage(), pageQuery.getSize());
        Page<MarkdownFile> queryPage=markdownMapper.pageQuery(pageQuery);
        List<MarkdownFileVO> markdownFileVOS=queryPage.stream().map(queryVO->{
            MarkdownFileVO markdownFileVO=new MarkdownFileVO();
            BeanUtils.copyProperties(queryVO,markdownFileVO);
            return markdownFileVO;
        }).collect(Collectors.toList());
        return new PageResult(queryPage.getTotal(), markdownFileVOS);
    }


    /**
     * 从传入的map图片集合中批量将图片信息存入数据库中
     * @param markdownImageCreateDTO
     * @param imagesMap
     */
    @Override
    public void saveMdImage(MarkdownImageCreateDTO markdownImageCreateDTO, Map<String,String> imagesMap) {
        for(Map.Entry<String,String> entry:imagesMap.entrySet()){
            MarkdownImage markdownImage=new MarkdownImage();
            markdownImage.setId(UUID.randomUUID().toString());
            markdownImage.setMarkdownId(markdownImageCreateDTO.getMarkdownId());
            markdownImage.setOssUrl(entry.getValue());
            markdownImageMapper.insert(markdownImage);
        }

    }

    @Override
    public String getById(String id) {
        MarkdownFile markdownFile = markdownMapper.getById(id);
        return markdownFile.getOssUrl();
    }

    @Override
    public void deleteBatch(List<String> ids) {
        for(String id:ids){
            markdownImageMapper.deleteById(id);
            markdownMapper.deleteById(id);
        }
        log.info("删除md文件成功，id为{}",ids);
    }
}
