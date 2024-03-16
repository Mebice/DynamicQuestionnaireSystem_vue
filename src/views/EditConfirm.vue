<script>
import Swal from 'sweetalert2'

export default {
    data() {
        return {
            previewData: {},  // 存儲問卷的基本信息
            previewQuestions: [],  // 存儲問題列表
            delQuestions: [],
        };
    },
    mounted() {
        // 獲取 questionnaireId
        const questionnaireId = this.$route.query.questionnaireId;
        console.log('問卷ID:', questionnaireId); // 添加这行

        // 讀取 localStorage 中的問卷基本信息
        const formDataJson = localStorage.getItem('formData');
        this.previewData = JSON.parse(formDataJson);
        console.log('previewData:', this.previewData); // 在控制台輸出previewData
        console.log('問卷ID（從 previewData）:', this.previewData.id); // 添加这行

        // 讀取 localStorage 中的問題列表
        const tableDataJson = localStorage.getItem('tableData');
        this.previewQuestions = JSON.parse(tableDataJson);
        console.log('previewQuestions:', this.previewQuestions); // 在控制台輸出previewQuestions

        // 讀取 localStorage 中的刪除問題列表
        const deletedItemsJson = localStorage.getItem('deletedItems');
        this.delQuestions = deletedItemsJson ? JSON.parse(deletedItemsJson) : [];
        console.log('delQuestions:', this.delQuestions);

        // 初始化 selectedOptions 和 selectedOption
        this.previewQuestions.forEach(item => {
            if (item.questionType === '多選') {
                item.selectedOptions = new Array(item.options.length).fill(false);
            } else {
                item.selectedOption = null;
            }

            // 处理选项中的分号
            if (typeof item.options === 'string') {
                item.options = item.options.split(';').map(option => option.trim());
            }
        })

    },
    methods: {

        fetchQuestionnaireData() {
            // 添加從服務器獲取問卷數據並更新組件數據屬性的邏輯。
            // 例如：
            console.log('正在獲取問卷數據...');
        },

        moveToPreviousPage(item) {


            // 回上一頁，并将整个 item 对象传递过去
            // this.$router.push({
            //     name: 'EditQuestionnaire',
            //     query: {
            //         questionnaireId: item.questionnaire.id,
            //         questionnaire: JSON.stringify(item.questionnaire),
            //         questionList: JSON.stringify(item.questionList)
            //     }
            // });
            // 返回上一頁
            this.$router.go(-1);

        },

        saveWithoutPublish() {
            if (this.isPublishChecked) {
                // 調用 fetchQuestionnaireData 方法
                this.fetchQuestionnaireData();
            }

            try {
                console.log('this.previewData.id (before request):', this.previewData.id);
                const requestBody = {
                    questionnaire: {
                        id: this.previewData.id,  // 將問卷 ID 包含在請求中
                        title: this.previewData.title,
                        description: this.previewData.describe,
                        published: false,
                        startDate: this.previewData.startDate,
                        endDate: this.previewData.endDate,
                    },
                    questionList: this.previewQuestions.map((item, index) => ({
                        qnId: item.qnId,
                        quId: parseInt(item.quId),
                        qTitle: item.question,
                        optionType: item.questionType,
                        necessary: item.isNecessary,
                        option: item.options.join(";"),
                    })),
                    deleteQuestionList: this.delQuestions.map((item) => ({
                        qnId: item.qnId,
                        quId: parseInt(item.quId)
                    })),

                }
                console.log('this.previewData.id:', this.previewData.id)
                console.log('请求的URL', 'http://localhost:8080/api/quiz/update');
                // console.log('发送的请求体：', JSON.stringify(requestBody));
                console.log(requestBody);

                fetch('http://localhost:8080/api/quiz/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                })

                    .then((response) => {
                        console.log('收到 API 響應：', response);

                        // 检查 HTTP 状态码
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        return response.json();
                    })

                    .then((responseData) => {
                        console.log('解析的 JSON 數據：', responseData);
                        console.log('問卷保存成功：', responseData);

                        // 調用 fetchQuestionnaireData 方法
                        this.fetchQuestionnaireData();
                    })

                // 清空 localStorage
                localStorage.removeItem('formData');
                localStorage.removeItem('tableData');
                localStorage.removeItem('deletedItems');

                Swal.fire({
                    icon: 'success',
                    title: '儲存成功',
                });

                // 导航到后台列表页
                this.$router.push('/BackstageList')

            } catch (error) {
                console.error('保存失敗：', error);
            };
        },

        savePublish() {
            Swal.fire({
                title: '確認發布此問卷?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: '確認',
                cancelButtonText: '取消'
            }).then((result) => {
                //點擊確認按鈕後
                if (result.isConfirmed) {

                    // 如果勾選了發布問卷，執行相應的邏輯
                    if (this.isPublishChecked) {
                        // 調用 fetchQuestionnaireData 方法
                        this.fetchQuestionnaireData();
                    }

                    try {
                        console.log('this.previewData.id (before request):', this.previewData.id);
                        const requestBody = {
                            questionnaire: {
                                id: this.previewData.id,  // 將問卷 ID 包含在請求中
                                title: this.previewData.title,
                                description: this.previewData.describe,
                                published: true,
                                startDate: this.previewData.startDate,
                                endDate: this.previewData.endDate,
                            },
                            questionList: this.previewQuestions.map((item, index) => ({
                                qnId: item.qnId,
                                quId: parseInt(item.quId),
                                qTitle: item.question,
                                optionType: item.questionType,
                                necessary: item.isNecessary,
                                option: item.options.join(";"),
                            })),
                            deleteQuestionList: this.delQuestions.map((item) => ({
                                qnId: item.qnId,
                                quId: parseInt(item.quId)
                            })),

                        }
                        console.log('this.previewData.id:', this.previewData.id)
                        console.log('请求的URL', 'http://localhost:8080/api/quiz/update');
                        // console.log('发送的请求体：', JSON.stringify(requestBody));
                        console.log(requestBody);

                        fetch('http://localhost:8080/api/quiz/update', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody),
                        })

                            .then((response) => {
                                console.log('收到 API 響應：', response);

                                // 检查 HTTP 状态码
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }

                                return response.json();
                            })

                            .then((responseData) => {
                                console.log('解析的 JSON 數據：', responseData);
                                console.log('問卷保存成功：', responseData);

                                // 調用 fetchQuestionnaireData 方法
                                this.fetchQuestionnaireData();
                            })

                        // 清空 localStorage
                        localStorage.removeItem('formData');
                        localStorage.removeItem('tableData');
                        localStorage.removeItem('deletedItems');

                        Swal.fire({
                            icon: 'success',
                            title: '發布成功',
                        });

                        // 导航到后台列表页
                        this.$router.push('/BackstageList')

                    } catch (error) {
                        console.error('保存失敗：', error);
                    };
                }
            })
        }

    }
}
</script>
<template>
    <div class="bgArea">
        <!-- 顯示問卷基本信息 -->
        <div class="titleArea">
            <p>{{ previewData.startDate + ' ~ ' + previewData.endDate }}</p>
            <h2>{{ previewData.title }}</h2>
            <p>{{ previewData.describe }}</p>
        </div>

        <div class="infoArea">
            <div class="personalInfoContentArea">
                <div class="infoTop">基本資料</div>
                <div class="personalInfoContent">
                    <label for="">姓名</label>
                    <input class="infoInput" type="text" :disabled="true">
                    <label for="">手機</label>
                    <input class="infoInput" type="text" :disabled="true">
                </div>
                <div class="personalInfoContent">
                    <label for="">信箱</label>
                    <input class="infoInputThree" type="text" :disabled="true">
                    <label for="">年齡</label>
                    <input class="infoInput" type="text" :disabled="true">
                </div>
            </div>
        </div>

        <!-- 顯示問題列表 -->
        <!-- <h3>問題列表</h3> -->
        <div class="questionListArea">
            <div class="questionList" v-for="(item, index) in previewQuestions" :key="index">
                <div class="questionListInside">
                    <div class="qTitleAndNecessary">
                        <p>{{ item.quId + '. ' + item.question + ' (' + item.questionType + ')' }}</p>
                        <span v-if="item.isNecessary" style="color: red;font-size:10pt">*[必填]</span>
                    </div>
                    <!-- <p><strong>第</strong>{{ index + 1 }}題</p>
                    <p><strong>問題：</strong>{{ item.question }}</p>
                    <p><strong>類型：</strong>{{ item.questionType }}</p>
                    <p><strong>必填：</strong>{{ item.isNecessary ? '是' : '否' }}</p> -->

                    <!-- 根據問題類型呈現選項 -->
                    <div class="questionOption" v-if="item.questionType === '多選'">
                        <div class="option-checkbox" v-for="(option, optionIndex) in item.options" :key="optionIndex">
                            <input type="checkbox" :id="`option_${index}_${optionIndex}`" :value="option"
                                v-model="item.selectedOptions[optionIndex]" :disabled="true" />
                            <label class="optionText" :for="`option_${index}_${optionIndex}`">{{ option }}</label>
                        </div>
                    </div>
                    <div v-else>
                        <div class="option-radio" v-for="(option, optionIndex) in item.options" :key="optionIndex">
                            <input type="radio" :id="`option_${index}_${optionIndex}`" :value="option"
                                v-model="item.selectedOption" :disabled="true" />
                            <label class="optionText" :for="`option_${index}_${optionIndex}`">{{ option }}</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- 返回上一步 -->
        <div class="btnArea">
            <div class="publishCheckbox">
                <input type="checkbox" v-model="isPublishChecked"><span>發布問卷</span>
            </div>
            <div class="buttons">
                <i class="fa-solid fa-arrow-left" @click="moveToPreviousPage"></i>
                <i class="fa-solid fa-floppy-disk" @click="isPublishChecked ? savePublish() : saveWithoutPublish()"></i>

                <!-- <button class="btn" @click="moveToPreviousPage">返回上一步</button>
            <button class="btn" @click="saveWithoutPublish">僅保存</button>
            <button class="btn" @click="savePublish">保存並發布</button> -->
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$maincolor: #A4804C;

.bgArea {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
                    border: 1.5px solid $maincolor;
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

                .optionText {
                    margin-left: 1%;
                }
            }
        }
    }

    .btnArea {
        width: 60%;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
        padding: 15px 0;
        margin: -12px 0 30px 0;
        color: #6e4e23;
        font-weight: 700;

        span {
            margin-left: 10px;
        }

        .fa-arrow-left {
            // color: rgba(161, 158, 158, 0.804);
            // background-color: rgba(211, 211, 211, 0.804);
            font-size: 20pt;
            position: relative;
            margin-bottom: 50px;
            transition: all 0.5s ease;
            border-radius: 50%;
            padding: 12px;
            margin: 0 60px;

            &:hover {
                background-color: rgba(143, 143, 143, 0.804);
                cursor: pointer;
            }

            /* 使用伪元素添加文字 */
            &::after {
                content: '上一頁';
                color: rgb(255, 255, 255);
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

        .fa-floppy-disk {
            // color: rgba(161, 158, 158, 0.804);
            // background-color: rgba(211, 211, 211, 0.804);
            font-size: 20pt;
            position: relative;
            margin-bottom: 50px;
            margin: 0 60px;
            transition: all 0.5s ease;
            border-radius: 50%;
            padding: 12px 15px;

            &:hover {
                background-color: rgba(143, 143, 143, 0.804);
                cursor: pointer;
            }

            /* 使用伪元素添加文字 */
            &::after {
                content: '儲存';
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
}
</style>