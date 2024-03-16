<script>
import Swal from 'sweetalert2'
export default {
    data() {
        return {
            formData: {
                answers: {},  // 存储单选和多选题的答案
                qnId: '',
                quId: '',
                selectOptionArr: [],
                personalInfo: {
                    name: '',
                    phone: '',
                    email: '',
                    age: ''
                }
            },

        }
    },
    created() {

        // 从 sessionStorage 中获取 questionnaire
        const storedQuestionnaire = sessionStorage.getItem('questionnaire');
        this.questionnaire = JSON.parse(storedQuestionnaire);

        // 从 sessionStorage 中获取 questionList
        const storedQuestionList = sessionStorage.getItem('questionList');
        this.questionList = JSON.parse(storedQuestionList);

        // 从 sessionStorage 中获取 formData
        const storedFormData = sessionStorage.getItem('formData');
        this.formData = JSON.parse(storedFormData);

        // 从 sessionStorage 中获取 selectOptionArr
        const storedSelectOptionArr = sessionStorage.getItem('selectOptionArr');
        this.selectOptionArr = JSON.parse(storedSelectOptionArr);

        console.log('Loaded questionnaire:', this.questionnaire);
        console.log('Loaded questionList:', this.questionList);
        console.log('Loaded formData:', this.formData);
        console.log('Loaded selectOptionArr:', this.selectOptionArr);
    },

    activated(){
    },

    methods: {

        //上一頁
        moveToPreviousPage() {

            this.$router.back();
        },

        //送出
        sumit() {
            Swal.fire({
                title: '確認提交問卷嗎?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '確定',
                cancelButtonText: '取消'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.formData.answers.forEach(answer => {
                        const requestBody = {
                            user: {
                                name: this.formData.personalInfo.name,
                                phoneNumber: this.formData.personalInfo.phone,
                                email: this.formData.personalInfo.email,
                                age: this.formData.personalInfo.age,
                                questionnaireId: answer.qnId,
                                questionId: answer.quId,
                                ans: answer.ans,
                            },
                        };

                        console.log('发送的请求体：', JSON.stringify(requestBody));

                        // 在此处将请求体发送到后端
                        fetch('http://localhost:8080/api/user/create', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody),
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                console.log('問卷作答成功：', data);
                                Swal.fire({
                                    icon: 'success',
                                    title: '問卷提交成功',
                                });
                                this.$router.push('/ForestageList');
                            })
                            .catch((error) => {
                                console.error('問卷作答失敗：', error);
                            });
                    });
                }
            })
        }
    }
}
</script>

<template>
    <div class="bgArea">
        <!-- <h3>{{ formData }}</h3>
        <h3>{{ selectOptionArr }}</h3> -->
        <!-- <div class="title">
            <h1>{{ questionnaire.title }}</h1>
            <h5>{{ questionnaire.startDate + ' ~ ' + questionnaire.endDate
            }}</h5>
            <h5>{{ '描述 : ' + questionnaire.description }}</h5>
        </div> -->
        <div class="titleArea">
            <p>{{ questionnaire.startDate + ' ~ ' +
                questionnaire.endDate }}</p>
            <h2>{{ questionnaire.title }}</h2>
            <p>{{ questionnaire.description }}</p>
        </div>
        <div class="infoArea">
            <div class="personalInfoContentArea">
                <div class="infoTop">基本資料</div>
                <div class="personalInfoContent">
                    <label for="">姓名</label>
                    <input type="text" id="name" v-model="formData.personalInfo.name" :disabled="true">

                    <label for="">手機</label>
                    <input type="text" id="phoneNumber" v-model="formData.personalInfo.phone" :disabled="true">
                </div>
                <div class="personalInfoContent">
                    <label for="">信箱</label>
                    <input type="text" id="email" v-model="formData.personalInfo.email" :disabled="true">

                    <label for="">年齡</label>
                    <input type="text" id="age" v-model="formData.personalInfo.age" :disabled="true">
                </div>

            </div>
        </div>
        <div class="questionListArea">
            <div class="questionList" v-for="(item, index) in questionList " :key="index">
                <div class="questionListInside">
                    <div class="qTitleAndNecessary">
                        <p>{{ item.quId + '. ' + item.qTitle + ' (' + item.optionType + ')' }}</p>
                        <span v-if="item.necessary" style="color: red;font-size:10pt">*[必填]</span>
                    </div>

                    <!-- 在每個問題下方顯示已選擇的答案 -->
                    <!-- <p>已選擇：
                <template v-if="Array.isArray(selectOptionArr[index])">
                    {{ selectOptionArr[index].join(' ; ') }}
                </template>
<template v-else>
                    {{ selectOptionArr[index] }}
                </template>
</p> -->

                    <!-- 根據問題類型呈現選項 -->
                    <div v-for="(option, optionIndex) in item.option.split(';')" :key="optionIndex">
                        <!-- 使用 v-if 和 v-else 來區分單選和多選 -->
                        <input v-if="item.optionType === '單選'" type="radio" :name="'question_' + index" :value="option"
                            v-model="selectOptionArr[index]" :checked="selectOptionArr[index] === option"
                            :disabled="true">
                        <input v-else type="checkbox" :id="'question_' + index + '_' + optionIndex" :value="option"
                            @change="test(index, option)"
                            :checked="selectOptionArr[index] && selectOptionArr[index].includes(option)"
                            :disabled="true">

                        <label class="optionText" :for="'question_' + index + '_' + optionIndex"
                            :class="{ 'checked': selectOptionArr[index] === option || selectOptionArr[index] && selectOptionArr[index].includes(option) }">
                            {{ option }}
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <!-- <button class="btn" @click="moveToPreviousPage">上一頁</button> -->
        <i class="fa-solid fa-arrow-left" @click="moveToPreviousPage"></i>
        <i class="fa-solid fa-file-arrow-up" @click="sumit"></i>
        <!-- <button class="btn" @click="sumit">送出</button> -->

    </div>
</template>

<style lang="scss" scoped>
$maincolor: #3F6148;

.bgArea {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f4f4ed;


    .titleArea {
        width: 60%;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
        padding-top: 15px;
        margin: 2% 0;
        color: $maincolor;
        font-weight: 700;

    }

    .infoArea {
        width: 60%;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
        padding: 2% 0 2% 0;
        margin-bottom: 2%;
        color: $maincolor;
        font-weight: 700;


        .infoTop {
            width: 100%;
            text-align: center;
            margin: 10px 0;
        }

        .personalInfoContentArea {
            width: 93%;
            display: flex;
            flex-direction: column;
            align-items: center;
            border: 2px solid #ede9e6;
            border-radius: 10px;


            .personalInfoContent {
                margin: 0 -10px 0 20px;
                padding: 0 0 3% 0;

                input {
                    width: 250px;
                    margin: 0 30px 0 10px;
                    padding-left: 5px;
                    border-radius: 10px;
                }

            }
        }

    }

    .questionListArea {
        width: 60%;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2% 0 0 0;
        border-radius: 10px;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
        margin-bottom: 3%;
        color: $maincolor;
        font-weight: 700;


        .questionList {
            width: 93%;
            background-color: #fff;
            border-radius: 10px;
            margin-bottom: 3%;
            border: 2px solid #ede9e6;


            .questionListInside {

                padding: 2% 10% 2% 10%;

                .qTitleAndNecessary {
                    display: flex;
                    margin: 0 0 -10px 0;
                }

                .checked::before {
                    content: '\2713';
                    /* Unicode 符號表示打勾 */
                    color: green;
                    /* 綠色 */
                    font-weight: bold;
                    position: absolute;
                    left: 29.5%;
                }

                .optionText {
                    margin-left: 3%;
                }
            }

        }
    }

    .fa-arrow-left {
        color: rgba(161, 158, 158, 0.804);
        background-color: rgba(211, 211, 211, 0.804);
        font-size: 20pt;
        margin-bottom: 50px;
        position: fixed;
        left: 100px;
        bottom: 10px;
        transition: all 0.5s ease;
        border-radius: 50%;
        padding: 12px;

        &:hover {
            background-color: rgba(143, 143, 143, 0.804);
            cursor: pointer;
        }

        /* 使用伪元素添加文字 */
        &::after {
            content: '上一頁';
            color: white;
            font-size: 10pt;
            display: block;
            position: absolute;
            top: 50%;
            /* 相对于父元素垂直居中 */
            left: 50%;
            /* 相对于父元素水平居中 */
            transform: translate(-50%, -50%);
            /* 平移并旋转文字 */
            opacity: 0;
            /* 初始状态透明 */
            transition: opacity 0.3s ease;
            /* 添加过渡效果 */
            white-space: nowrap;
            /* 防止文字换行 */
        }

        &:hover::after {
            opacity: 1;
        }
    }

    .fa-file-arrow-up {
        color: rgba(161, 158, 158, 0.804);
        background-color: rgba(211, 211, 211, 0.804);
        font-size: 20pt;
        margin-bottom: 50px;
        position: fixed;
        right: 100px;
        bottom: 10px;
        transition: all 0.5s ease;
        border-radius: 50%;
        padding: 12px 15px;

        &:hover {
            background-color: rgba(143, 143, 143, 0.804);
            cursor: pointer;
        }

        /* 使用伪元素添加文字 */
        &::after {
            content: '提交';
            color: white;
            font-size: 10pt;
            display: block;
            position: absolute;
            top: 50%;
            /* 相对于父元素垂直居中 */
            left: 50%;
            /* 相对于父元素水平居中 */
            transform: translate(-50%, -50%);
            /* 平移并旋转文字 */
            opacity: 0;
            /* 初始状态透明 */
            transition: opacity 0.3s ease;
            /* 添加过渡效果 */
            white-space: nowrap;
            /* 防止文字换行 */
        }

        &:hover::after {
            opacity: 1;
        }
    }
}
</style>