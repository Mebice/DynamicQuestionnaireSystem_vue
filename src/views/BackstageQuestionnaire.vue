<script>
import Swal from 'sweetalert2'
export default {
    data() {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 2);

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 7);

        return {
            formData: {
                questionnaire: '',
                describe: '',
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],

            },
        };
    },
    methods: {

        //默認的部分，結束卻還是可以選擇早於開始的時間，做判斷:點擊下一頁時彈出結束不可小於開始時間
        handleStartDateChange() {
            // 當開始時間變化時，更新結束時間的最小值
            this.$refs.endDateInput.min = this.formData.startDate;
        },

        moveToNextPage() {
            console.log('Move to next page clicked');
            // 检查问题名称和问题描述是否为空
            if (!this.formData.questionnaire.trim() || !this.formData.describe.trim()) {
                Swal.fire({
                    title: '請將標題和描述填寫完整',
                    text: '標題、描述不得為空。',
                    icon: 'warning',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: '確定'
                });
                return; // 如果有任何一項為空，停止執行
            }
            // 將表單數據轉為 JSON 字串，存入 localStorage
            const formDataJson = JSON.stringify(this.formData);
            localStorage.setItem('formData', formDataJson);

            // 判断是否为新增问题流程，是的话清空 localStorage
            if (!this.$route.params.questionId) {
                localStorage.removeItem('formData');
            }

            // 在清空 localStorage 之前保存数据，确保数据在下一页被保留
            this.$router.push('/BackstageQuestion')

        },
        cancelPage() {
            Swal.fire({
                title: '取消建立?',
                text: `是否取消本次建立的問卷?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: '是',
                cancelButtonText: '否'
            }).then((result) => {         //點擊確認按鈕後
                if (result.isConfirmed) {
                    // 清空 localStorage
                    localStorage.removeItem('formData');
                    localStorage.removeItem('tableData');

                    console.log('cancelPage is called');
                    console.log('questionId:', this.$route.params.questionId);

                    this.$router.push('/BackstageList');
                }
            })
        },
    },
    created() {
        // 在组件创建时尝试从 localStorage 恢复数据
        const storedData = localStorage.getItem('formData');

        // 检查路由状态，如果是由上一步返回的，不清空 localStorage
        if (storedData && this.$route.name !== 'BackstageList') {
            this.formData = JSON.parse(storedData);
        } else {
            localStorage.removeItem('formData');
        }
    },
    beforeRouteLeave(to, from, next) {
        // 保存表单数据到 localStorage
        localStorage.setItem('formData', JSON.stringify(this.formData));
        next();
    }
}
</script>
<template>
    <div class="bgArea">
        <div class="form-container">
            <label for="questionnaire">問卷名稱：</label>
            <input class="titleInput" type="text" name="questionnaire" v-model="formData.questionnaire">

            <label for="describe">問卷說明：</label>
            <textarea class="describe" v-model="formData.describe"></textarea>

            <div class="dateInputArea">
                <div class="dateCombination">
                    <label class="dateText1" for="startDate">開始時間：</label>
                    <input class="dateInput" type="date" id="startDate" v-model="formData.startDate"
                        @change="handleStartDateChange">
                </div>
                <div class="dateCombination">
                    <label class="dateText2" for="endDate">結束時間：</label>
                    <input class="dateInput" type="date" id="endDate" v-model="formData.endDate" ref="endDateInput">
                </div>
            </div>
            <!-- 其他問卷相關的表單項目 -->
            <div class="button-container">
                <i class="fa-solid fa-rotate-left" @click="cancelPage"></i>
                <!-- <button @click="moveToNextPage">下一步</button> -->
                <i class="fa-solid fa-arrow-right" @click="moveToNextPage"></i>
            </div>
        </div>
    </div>
</template>



<style lang="scss" scoped>
.bgArea {
    background-color: #f4f4ed;
    width: 100vw;
    height: 90vh;
    display: flex;
    align-items: center;
    /* 垂直置中 */
    justify-content: center;
    /* 水平置中 */
}

.form-container {
    width: 450px;
    height: 500px;
    background-color: #fff;
    color: #6e4e23;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
    display: block;
    margin-bottom: 8px;
}

.titleInput {
    width: 100%;
    height: 33px;
    margin-bottom: 16px;
    box-sizing: border-box;
}

.describe {
    height: 200px;
    width: 100%;
    resize: none;
    /* 防止 textarea 被手動調整大小 */
}

.dateInputArea {
    display: flex;
    margin-top: 16px;
    justify-content: space-between;

    .dateCombination {
        display: flex;
        flex-direction: column;

        // .dateText2 {
        //     margin-left: 37px;
        // }

        .dateInput {
            height: 30px;
            width: 180px;
            text-align: center;
        }
    }
}

.fa-rotate-left {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
        background-color: rgba(143, 143, 143, 0.804);
        cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
        content: '返回';
        color: #fff;
        font-size: 10pt;
        display: block;
        position: absolute;
        top: 90%;
        /* 相对于父元素垂直居中 */
        left: 35.5%;
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

.fa-arrow-right {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
        background-color: rgba(143, 143, 143, 0.804);
        cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
        content: '下一頁';
        color: #fff;
        font-size: 10pt;
        display: block;
        position: absolute;
        top: 90%;
        /* 相对于父元素垂直居中 */
        left: 64.7%;
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

.button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
}

button {
    background-color: #A4804C;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;

    &:hover {
        cursor: pointer;
        background-color: #DBD3A4;
    }
}
</style>
